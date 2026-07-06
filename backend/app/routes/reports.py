from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

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


@router.get("/", response_model=List[schemas.WeeklyReportResponse])
def get_all_reports(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_manager_role),
):
    """Get all weekly reports across the team. Manager only."""
    return (
        db.query(models.WeeklyReport)
        .order_by(models.WeeklyReport.submitted_at.desc())
        .all()
    )


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
