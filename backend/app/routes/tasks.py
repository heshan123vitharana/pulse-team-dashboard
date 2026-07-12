from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new task in a sprint."""
    sprint = db.query(models.Sprint).filter(models.Sprint.id == task_in.sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
        
    project = sprint.project
    if current_user.role.role_name.lower() != "manager" and current_user not in project.users:
         raise HTTPException(status_code=403, detail="Not authorized to create tasks for this sprint")
         
    new_task = models.Task(**task_in.model_dump())
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.put("/{task_id}/status", response_model=schemas.TaskResponse)
def update_task_status(
    task_id: int,
    status_update: schemas.TaskUpdateStatus,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update task status (drag and drop)."""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    project = task.sprint.project
    if current_user.role.role_name.lower() != "manager" and current_user not in project.users:
         raise HTTPException(status_code=403, detail="Not authorized to update tasks for this sprint")
         
    task.status = status_update.status
    db.commit()
    db.refresh(task)
    return task

@router.get("/sprint/{sprint_id}", response_model=List[schemas.TaskResponse])
def get_tasks_for_sprint(
    sprint_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get all tasks for a specific sprint."""
    sprint = db.query(models.Sprint).filter(models.Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")
        
    project = sprint.project
    if current_user.role.role_name.lower() != "manager" and current_user not in project.users:
         raise HTTPException(status_code=403, detail="Not authorized to view tasks for this sprint")
         
    tasks = db.query(models.Task).filter(models.Task.sprint_id == sprint_id).all()
    return tasks
