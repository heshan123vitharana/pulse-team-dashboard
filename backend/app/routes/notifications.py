from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
import jwt

from ..database import get_db
from ..config import settings
from .. import models
from ..ws import manager

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        if not email:
            await websocket.close(code=1008)
            return
            
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            await websocket.close(code=1008)
            return
            
        user_id = user.id
        await manager.connect(websocket, user_id) # type: ignore
        
        try:
            while True:
                # Keep connection alive, wait for incoming messages (if any)
                data = await websocket.receive_text()
        except WebSocketDisconnect:
            manager.disconnect(websocket, user_id) # type: ignore
            
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close(code=1008)
