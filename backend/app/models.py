from datetime import date, datetime
from sqlalchemy import Integer, String, Text, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

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
    submission_status: Mapped[str] = mapped_column(String(50), server_default="submitted")
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="reports")
    project = relationship("Project", back_populates="reports")