from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user, check_manager_role

router = APIRouter()


@router.get("/", response_model=List[schemas.ProjectResponse])
def get_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List projects. Managers see all, members see only their assigned projects."""
    if current_user.role.role_name.lower() == "manager":
        return db.query(models.Project).options(selectinload(models.Project.users)).all()
    else:
        return current_user.projects


@router.post("/", response_model=schemas.ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_manager_role),
):
    """Create a new project. Manager only."""
    new_project = models.Project(**project_in.model_dump())
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


@router.get("/{project_id}", response_model=schemas.ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get a single project by ID."""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=schemas.ProjectResponse)
def update_project(
    project_id: int,
    project_in: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_manager_role),
):
    """Update a project. Manager only."""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    update_data = project_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)
        
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_manager_role),
):
    """Delete a project. Manager only."""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    db.delete(project)
    db.commit()

@router.post("/{project_id}/assign/{user_id}", status_code=status.HTTP_200_OK)
def assign_user(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_manager_role),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user not in project.users:
        project.users.append(user)
        db.commit()
    
    return {"message": "User assigned to project"}

@router.delete("/{project_id}/assign/{user_id}", status_code=status.HTTP_200_OK)
def unassign_user(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(check_manager_role),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user in project.users:
        project.users.remove(user)
        db.commit()
    
    return {"message": "User removed from project"}
