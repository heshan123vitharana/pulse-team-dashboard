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
    """Create a new task in a sprint or backlog."""
    project = db.query(models.Project).filter(models.Project.id == task_in.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if current_user.role.role_name.lower() != "manager" and current_user not in project.users:
         raise HTTPException(status_code=403, detail="Not authorized to create tasks for this project")
         
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
        
    project = task.project
    if current_user.role.role_name.lower() != "manager" and current_user not in project.users:
         raise HTTPException(status_code=403, detail="Not authorized to update tasks for this project")
         
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

@router.get("/backlog/{project_id}", response_model=List[schemas.TaskResponse])
def get_backlog_tasks(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get all unassigned (backlog) tasks for a project."""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if current_user.role.role_name.lower() != "manager" and current_user not in project.users:
         raise HTTPException(status_code=403, detail="Not authorized to view tasks for this project")
         
    tasks = db.query(models.Task).filter(models.Task.project_id == project_id, models.Task.sprint_id == None).all()
    return tasks

@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Fully update a task (title, description, assignee, sprint_id, etc)."""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    project = task.project
    if current_user.role.role_name.lower() != "manager" and current_user not in project.users:
         raise HTTPException(status_code=403, detail="Not authorized to update tasks for this project")
         
    update_data = task_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
        
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Delete a task."""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    project = task.project
    if current_user.role.role_name.lower() != "manager" and current_user not in project.users:
         raise HTTPException(status_code=403, detail="Not authorized to delete tasks for this project")
         
    db.delete(task)
    db.commit()
    return None

# ==========================================
# COMMENTS
# ==========================================
@router.post("/{task_id}/comments", response_model=schemas.CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    task_id: int,
    comment_in: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    new_comment = models.Comment(**comment_in.model_dump(), task_id=task_id, author_id=current_user.id)
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

# ==========================================
# SUBTASKS
# ==========================================
@router.post("/{task_id}/subtasks", response_model=schemas.SubtaskResponse, status_code=status.HTTP_201_CREATED)
def create_subtask(
    task_id: int,
    subtask_in: schemas.SubtaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    new_subtask = models.Subtask(**subtask_in.model_dump(), task_id=task_id)
    db.add(new_subtask)
    db.commit()
    db.refresh(new_subtask)
    return new_subtask

@router.put("/subtasks/{subtask_id}", response_model=schemas.SubtaskResponse)
def update_subtask(
    subtask_id: int,
    subtask_update: schemas.SubtaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    subtask = db.query(models.Subtask).filter(models.Subtask.id == subtask_id).first()
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")
        
    update_data = subtask_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(subtask, key, value)
        
    db.commit()
    db.refresh(subtask)
    return subtask

@router.delete("/subtasks/{subtask_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subtask(
    subtask_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    subtask = db.query(models.Subtask).filter(models.Subtask.id == subtask_id).first()
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")
        
    db.delete(subtask)
    db.commit()
    return None
