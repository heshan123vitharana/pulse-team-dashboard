from typing import List, Optional
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
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
    return new_report


@router.get("/my-reports", response_model=List[schemas.WeeklyReportResponse])
def get_my_reports(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get all reports submitted by the currently logged-in user."""
    return (
        db.query(models.WeeklyReport)
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
    query = db.query(models.WeeklyReport)
    
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
    # 1. Total reports submitted this week / overall
    total_reports = db.query(models.WeeklyReport).count()
    
    # 2. Open blockers count (filtering out empty rows or 'none')
    open_blockers = db.query(models.WeeklyReport).filter(
        models.WeeklyReport.blockers != "",
        func.lower(models.WeeklyReport.blockers) != "none"
    ).count()
    
    # 3. Compliance status distribution (Grouped for Pie Chart)
    status_counts = db.query(
        models.WeeklyReport.submission_status, 
        func.count(models.WeeklyReport.id)
    ).group_by(models.WeeklyReport.submission_status).all()
    
    compliance_chart = [{"status": row[0], "count": row[1]} for row in status_counts]
    
    # 4. Workload distribution by project (Grouped for Bar Chart)
    project_distribution = db.query(
        models.Project.project_name,
        func.count(models.WeeklyReport.id)
    ).join(models.WeeklyReport).group_by(models.Project.project_name).all()
    
    project_chart = [{"project": row[0], "count": row[1]} for row in project_distribution]

    return {
        "summary": {
            "total_reports": total_reports,
            "open_blockers": open_blockers,
        },
        "charts": {
            "compliance": compliance_chart,
            "project_workload": project_chart
        }
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