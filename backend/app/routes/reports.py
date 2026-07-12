from typing import List, Optional
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user, check_manager_role

router = APIRouter()


@router.post("/", response_model=schemas.WeeklyReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    report_in: schemas.WeeklyReportCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Submit a weekly report for the currently logged-in user."""
    # Verify the project exists
    project = db.query(models.Project).filter(models.Project.id == report_in.project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    new_report = models.WeeklyReport(**report_in.model_dump(), user_id=current_user.id)
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    # Re-query with relationships eagerly loaded so the response serializer
    # can access report.user and report.project without lazy-load errors.
    new_report = (
        db.query(models.WeeklyReport)
        .options(
            selectinload(models.WeeklyReport.user),
            selectinload(models.WeeklyReport.project),
        )
        .filter(models.WeeklyReport.id == new_report.id)
        .first()
    )
    return new_report


@router.get("/my-reports", response_model=List[schemas.WeeklyReportResponse])
def get_my_reports(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get all reports submitted by the currently logged-in user."""
    return (
        db.query(models.WeeklyReport)
        .options(
            selectinload(models.WeeklyReport.user),
            selectinload(models.WeeklyReport.project),
        )
        .filter(models.WeeklyReport.user_id == current_user.id)
        .order_by(models.WeeklyReport.submitted_at.desc())
        .all()
    )


# ==========================================
# ADVANCED TEAM REPORTS WITH FILTERS FOR MANAGER
# ==========================================
@router.get("/", response_model=List[schemas.WeeklyReportResponse])
def get_all_reports(
    user_id: Optional[int] = Query(None, description="Filter by Team Member ID"),
    project_id: Optional[int] = Query(None, description="Filter by Project ID"),
    start_date: Optional[date] = Query(None, description="Filter from week start date"),
    end_date: Optional[date] = Query(None, description="Filter up to week end date"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_manager_role),
):
    """Get all weekly reports across the team with extensive filtering capabilities. Manager only."""
    query = (
        db.query(models.WeeklyReport)
        .options(
            selectinload(models.WeeklyReport.user),
            selectinload(models.WeeklyReport.project),
        )
    )

    if user_id:
        query = query.filter(models.WeeklyReport.user_id == user_id)
    if project_id:
        query = query.filter(models.WeeklyReport.project_id == project_id)
    if start_date:
        query = query.filter(models.WeeklyReport.week_start_date >= start_date)
    if end_date:
        query = query.filter(models.WeeklyReport.week_end_date <= end_date)

    return query.order_by(models.WeeklyReport.submitted_at.desc()).all()


# ==========================================
# DASHBOARD METRICS FOR CHARTS & VISUAL INSIGHTS
# ==========================================
@router.get("/dashboard-metrics")
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_manager_role),
):
    """Get visual insights and counters for the manager dashboard charts."""
    from datetime import date, timedelta as td

    today = date.today()
    # Current ISO week: Monday → Sunday
    week_start = today - td(days=today.weekday())  # Monday
    week_end = week_start + td(days=6)             # Sunday

    # 1. Total reports submitted overall
    total_reports = db.query(models.WeeklyReport).count()

    # 2. Open blockers count (filtering out empty / 'none')
    open_blockers = db.query(models.WeeklyReport).filter(
        models.WeeklyReport.blockers != "",
        func.lower(models.WeeklyReport.blockers) != "none"
    ).count()

    # Active projects count
    active_projects = db.query(models.Project).count()

    # All users (for compliance calculation)
    all_users = db.query(models.User).all()
    team_members_count = len(all_users)

    # 3. Compliance rate: % of team members who submitted a report this current week
    reports_this_week = db.query(models.WeeklyReport).filter(
        models.WeeklyReport.week_start_date >= week_start,
        models.WeeklyReport.week_end_date <= week_end,
    ).all()

    submitted_user_ids_this_week = {r.user_id for r in reports_this_week}
    compliance_rate = (
        round(len(submitted_user_ids_this_week) / team_members_count * 100)
        if team_members_count > 0 else 0
    )

    # 4. Per-member submission matrix (this week): submitted | pending | late
    member_status = []
    for user in all_users:
        user_report_this_week = next(
            (r for r in reports_this_week if r.user_id == user.id), None
        )
        if user_report_this_week:
            status = "submitted"
        else:
            # Late if we are past Friday of this week (weekday 4)
            status = "late" if today.weekday() >= 4 else "pending"

        member_status.append({
            "user_id": user.id,
            "name": user.name,
            "status": status,
        })

    # 5. Compliance status distribution for pie chart (all-time)
    status_counts = db.query(
        models.WeeklyReport.submission_status,
        func.count(models.WeeklyReport.id)
    ).group_by(models.WeeklyReport.submission_status).all()

    compliance_chart = [{"status": row[0], "count": row[1]} for row in status_counts]

    # 6. Workload distribution by project (bar chart)
    project_distribution = db.query(
        models.Project.project_name,
        func.count(models.WeeklyReport.id)
    ).join(models.WeeklyReport).group_by(models.Project.project_name).all()

    project_chart = [{"project": row[0], "count": row[1]} for row in project_distribution]

    # 7. Tasks completed trend — last 8 weeks (line chart)
    trend_data = []
    for i in range(7, -1, -1):  # 8 weeks ago → current week
        w_start = week_start - td(weeks=i)
        week_reports = db.query(models.WeeklyReport).filter(
            models.WeeklyReport.week_start_date == w_start,
        ).all()
        trend_data.append({
            "week": w_start.strftime("%b %d"),
            "reports": len(week_reports),
            "blockers": sum(
                1 for r in week_reports
                if r.blockers and r.blockers.lower() not in ("", "none")
            ),
        })

    return {
        "summary": {
            "total_reports": total_reports,
            "open_blockers": open_blockers,
            "active_projects": active_projects,
            "team_members": team_members_count,
            "compliance_rate": compliance_rate,
            "submitted_this_week": len(submitted_user_ids_this_week),
        },
        "charts": {
            "compliance": compliance_chart,
            "project_workload": project_chart,
            "trend": trend_data,
            "member_status": member_status,
        }
    }


@router.get("/auto-generate/{sprint_id}")
def auto_generate_report(
    sprint_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Auto-generate tasks_completed and tasks_planned strings based on a sprint's tasks for the logged-in user."""
    sprint = db.query(models.Sprint).filter(models.Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
        
    tasks = db.query(models.Task).filter(
        models.Task.sprint_id == sprint_id,
        models.Task.assignee_id == current_user.id
    ).all()
    
    completed_tasks = [t for t in tasks if t.status == "DONE"]
    planned_tasks = [t for t in tasks if t.status in ("TODO", "IN_PROGRESS")]
    
    tasks_completed_str = "\n".join([f"- {t.title}" for t in completed_tasks]) if completed_tasks else "None"
    tasks_planned_str = "\n".join([f"- {t.title}" for t in planned_tasks]) if planned_tasks else "None"
    
    return {
        "tasks_completed": tasks_completed_str,
        "tasks_planned": tasks_planned_str
    }


@router.get("/{report_id}", response_model=schemas.WeeklyReportResponse)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get a single report by ID. Team members can only view their own reports."""
    report = db.query(models.WeeklyReport).filter(models.WeeklyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    role = db.query(models.Role).filter(models.Role.id == current_user.role_id).first()
    is_manager = role and role.role_name.lower() == "manager"

    if not is_manager and report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only view your own reports.",
        )
    return report


@router.put("/{report_id}", response_model=schemas.WeeklyReportResponse)
def update_report(
    report_id: int,
    report_in: schemas.WeeklyReportUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update a report. Users can only update their own reports."""
    report = db.query(models.WeeklyReport).filter(models.WeeklyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
        
    if report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only update your own reports.",
        )
        
    update_data = report_in.model_dump(exclude_unset=True)
    
    # If project is updated, verify it exists
    if "project_id" in update_data:
        project = db.query(models.Project).filter(models.Project.id == update_data["project_id"]).first()
        if not project:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project not found")

    for key, value in update_data.items():
        setattr(report, key, value)
        
    db.commit()
    db.refresh(report)
    return report


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Delete a report. Users can only delete their own reports."""
    report = db.query(models.WeeklyReport).filter(models.WeeklyReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    if report.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    db.delete(report)
    db.commit()