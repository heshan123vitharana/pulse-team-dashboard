from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import logging
from typing import List

from app.database import get_db
from app.auth import get_current_user
from app.models import User, WeeklyReport, Project
from app.config import settings
from groq import Groq
from groq.types.chat import ChatCompletionMessageParam

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str

def get_team_context(db: Session) -> str:
    # Get all reports from the last 30 days for this manager's team
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    
    recent_reports = db.query(WeeklyReport).filter(WeeklyReport.submitted_at >= thirty_days_ago).all()
    
    if not recent_reports:
        return "No recent reports available."
        
    context_lines = []
    for report in recent_reports:
        user = db.query(User).filter(User.id == report.user_id).first()
        project = db.query(Project).filter(Project.id == report.project_id).first()
        
        user_name = user.name if user else f"User #{report.user_id}"
        project_name = project.project_name if project else "Unknown Project"
        
        line = f"- {user_name} on project '{project_name}': Status {report.submission_status}. "
        line += f"Accomplished: {report.tasks_completed}. "
        if report.blockers:
            line += f"Blockers: {report.blockers}. "
        if report.tasks_planned:
            line += f"Next Steps: {report.tasks_planned}."
            
        context_lines.append(line)
        
    return "\n".join(context_lines)

@router.post("/message", response_model=ChatResponse)
async def chat_with_assistant(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.role_name.lower() != "manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers can access the AI assistant"
        )
        
    if not settings.GROQ_API_KEY:
        return ChatResponse(response="It looks like the Groq API key is not configured in the backend. Please add GROQ_API_KEY to your .env file or environment variables to enable the AI assistant.")
        
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        
        context = get_team_context(db)
        
        system_prompt = f"""You are a helpful AI assistant for a team manager. 
Use the following recent weekly reports from the team to answer the manager's questions. 
Do not hallucinate data that is not in the context. If you don't know the answer based on the context, say so.

CONTEXT (Recent Weekly Reports):
{context}
"""

        messages: list[ChatCompletionMessageParam] = [
            {"role": "system", "content": system_prompt}
        ]
        for msg in request.history:
            if msg.role in ("user", "assistant"):
                messages.append({"role": msg.role, "content": msg.content})  # type: ignore[arg-type]
        messages.append({"role": "user", "content": request.message})

        completion = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=messages,
            temperature=0.5,
            max_tokens=500,
        )
        
        ai_response = completion.choices[0].message.content or "No response generated."
        return ChatResponse(response=ai_response)
        
    except Exception as e:
        logger.error(f"Error calling Groq API: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to communicate with AI service: {str(e)}"
        )
