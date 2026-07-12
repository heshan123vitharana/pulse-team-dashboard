from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter()

@router.get("/active", response_model=schemas.SprintResponse)
def get_active_sprint(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get the currently active sprint for a project."""
    
    # Check if user has access to this project
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if current_user.role.role_name.lower() != "manager" and current_user not in project.users:
         raise HTTPException(status_code=403, detail="Not authorized to view this project's sprints")

    sprint = db.query(models.Sprint).filter(
        models.Sprint.project_id == project_id,
        models.Sprint.is_active == True
    ).first()
    
    if not sprint:
        raise HTTPException(status_code=404, detail="No active sprint found for this project")
        
    return sprint

@router.post("/", response_model=schemas.SprintResponse, status_code=status.HTTP_201_CREATED)
def create_sprint(
    sprint_in: schemas.SprintCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new sprint."""
    project = db.query(models.Project).filter(models.Project.id == sprint_in.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if current_user.role.role_name.lower() != "manager" and current_user not in project.users:
         raise HTTPException(status_code=403, detail="Not authorized to create sprints for this project")
         
    # Deactivate existing active sprints for this project if new sprint is active
    if sprint_in.is_active:
        db.query(models.Sprint).filter(
            models.Sprint.project_id == sprint_in.project_id,
            models.Sprint.is_active == True
        ).update({"is_active": False})

    new_sprint = models.Sprint(**sprint_in.model_dump())
    db.add(new_sprint)
    db.commit()
    db.refresh(new_sprint)
    return new_sprint
