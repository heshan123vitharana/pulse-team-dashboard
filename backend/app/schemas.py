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
    project: Optional[ProjectResponse] = None

    class Config:
        from_attributes = True