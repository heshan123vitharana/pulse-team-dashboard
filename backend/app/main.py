from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from . import models
from .routes import auth as auth_router
from .routes import projects as projects_router
from .routes import reports as reports_router
from .routes import chat as chat_router
from .config import settings

# Auto-create all tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="REST API for the Pulse Team Dashboard — weekly report tracking and team management.",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # React CRA
        "http://localhost:5173",   # Vite
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth_router.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(projects_router.router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(reports_router.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(chat_router.router, prefix="/api/v1/chat", tags=["Chat"])


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "app": settings.PROJECT_NAME, "docs": "/docs"}
