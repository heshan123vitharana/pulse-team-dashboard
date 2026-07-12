from datetime import date, datetime
from sqlalchemy import Integer, String, Text, Date, DateTime, ForeignKey, func, Table, Column, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

user_projects = Table(
    "user_projects",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("project_id", Integer, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True)
)

# ==========================================
# 1. ROLES TABLE
# ==========================================
class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    role_name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    # Relationships
    users = relationship("User", back_populates="role")


# ==========================================
# 2. USERS TABLE
# ==========================================
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role_id: Mapped[int] = mapped_column(Integer, ForeignKey("roles.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    role = relationship("Role", back_populates="users")
    reports = relationship("WeeklyReport", back_populates="user")
    projects = relationship("Project", secondary=user_projects, back_populates="users")
    tasks = relationship("Task", back_populates="assignee")


# ==========================================
# 3. PROJECTS TABLE
# ==========================================
class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    project_name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    # Relationships
    reports = relationship("WeeklyReport", back_populates="project")
    users = relationship("User", secondary=user_projects, back_populates="projects")
    sprints = relationship("Sprint", back_populates="project")
    tasks = relationship("Task", back_populates="project")


# ==========================================
# 4. WEEKLY REPORTS TABLE
# ==========================================
class WeeklyReport(Base):
    __tablename__ = "weekly_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id"), nullable=False)
    week_start_date: Mapped[date] = mapped_column(Date, nullable=False)
    week_end_date: Mapped[date] = mapped_column(Date, nullable=False)
    tasks_completed: Mapped[str] = mapped_column(Text, nullable=False)
    tasks_planned: Mapped[str] = mapped_column(Text, nullable=False)
    blockers: Mapped[str] = mapped_column(Text, nullable=False)
    hours_worked: Mapped[int] = mapped_column(Integer, nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    submission_status: Mapped[str] = mapped_column(String(50), default="Submitted")
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    # Relationships
    user = relationship("User", back_populates="reports")
    project = relationship("Project", back_populates="reports")


# ==========================================
# 5. SPRINTS TABLE
# ==========================================
class Sprint(Base):
    __tablename__ = "sprints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    goal: Mapped[str] = mapped_column(Text, nullable=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    project = relationship("Project", back_populates="sprints")
    tasks = relationship("Task", back_populates="sprint")


# ==========================================
# 6. TASKS TABLE
# ==========================================
class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="TODO") # "TODO", "IN_PROGRESS", "REVIEW", "QA", "DONE"
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    sprint_id: Mapped[int] = mapped_column(Integer, ForeignKey("sprints.id", ondelete="CASCADE"), nullable=True)
    assignee_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    story_points: Mapped[int] = mapped_column(Integer, nullable=True)
    attachment_url: Mapped[str] = mapped_column(String(500), nullable=True)

    # Relationships
    project = relationship("Project", back_populates="tasks")
    sprint = relationship("Sprint", back_populates="tasks")
    assignee = relationship("User", back_populates="tasks")
    comments = relationship("Comment", back_populates="task", cascade="all, delete-orphan")
    subtasks = relationship("Subtask", back_populates="task", cascade="all, delete-orphan")


# ==========================================
# 7. COMMENTS TABLE
# ==========================================
class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    task_id: Mapped[int] = mapped_column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    author_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    task = relationship("Task", back_populates="comments")
    author = relationship("User")


# ==========================================
# 8. SUBTASKS TABLE
# ==========================================
class Subtask(Base):
    __tablename__ = "subtasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    task_id: Mapped[int] = mapped_column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    task = relationship("Task", back_populates="subtasks")