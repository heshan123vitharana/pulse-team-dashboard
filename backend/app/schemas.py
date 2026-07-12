from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional


# 1. AUTH & USER SCHEMAS
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role_id: int

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class UserResponse(UserBase):
    id: int
    role_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str 

# 2. PROJECT SCHEMAS
class ProjectBase(BaseModel):
    project_name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    users: list[UserResponse] = []

    class Config:
        from_attributes = True

class ProjectSimpleResponse(ProjectBase):
    id: int

    class Config:
        from_attributes = True


# 3. WEEKLY REPORT SCHEMAS
class WeeklyReportBase(BaseModel):
    project_id: int
    week_start_date: date
    week_end_date: date
    tasks_completed: str
    tasks_planned: str
    blockers: str
    hours_worked: Optional[int] = None
    notes: Optional[str] = None

class WeeklyReportCreate(WeeklyReportBase):
    pass

class WeeklyReportUpdate(BaseModel):
    project_id: Optional[int] = None
    week_start_date: Optional[date] = None
    week_end_date: Optional[date] = None
    tasks_completed: Optional[str] = None
    tasks_planned: Optional[str] = None
    blockers: Optional[str] = None
    hours_worked: Optional[int] = None
    notes: Optional[str] = None

class WeeklyReportResponse(WeeklyReportBase):
    id: int
    user_id: int
    submission_status: str
    submitted_at: datetime
    user: Optional[UserResponse] = None # Manager dashboard can see user's details
    project: Optional[ProjectSimpleResponse] = None

    class Config:
        from_attributes = True


# 4. SPRINT SCHEMAS
class SprintBase(BaseModel):
    name: str
    start_date: date
    end_date: date
    goal: Optional[str] = None
    is_active: bool = True

class SprintCreate(SprintBase):
    project_id: int

class SprintUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    goal: Optional[str] = None
    is_active: Optional[bool] = None

class SprintResponse(SprintBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

# 5. COMMENT SCHEMAS
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    task_id: int
    author_id: int
    created_at: datetime
    author: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# 6. SUBTASK SCHEMAS
class SubtaskBase(BaseModel):
    title: str
    is_completed: bool = False

class SubtaskCreate(SubtaskBase):
    pass

class SubtaskUpdate(BaseModel):
    title: Optional[str] = None
    is_completed: Optional[bool] = None

class SubtaskResponse(SubtaskBase):
    id: int
    task_id: int

    class Config:
        from_attributes = True

# 7. TASK SCHEMAS
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "TODO"
    story_points: Optional[int] = None
    attachment_url: Optional[str] = None

class TaskCreate(TaskBase):
    project_id: int
    sprint_id: Optional[int] = None
    assignee_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    assignee_id: Optional[int] = None
    story_points: Optional[int] = None
    sprint_id: Optional[int] = None
    attachment_url: Optional[str] = None

class TaskUpdateStatus(BaseModel):
    status: str

class TaskResponse(TaskBase):
    id: int
    project_id: int
    sprint_id: Optional[int] = None
    assignee_id: Optional[int] = None
    subtasks: list[SubtaskResponse] = []
    comments: list[CommentResponse] = []

    class Config:
        from_attributes = True