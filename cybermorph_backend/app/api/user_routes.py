# app/api/user_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.database import models
from app.schemas.user import UserOut
from app.core.security import get_current_user_info

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserOut)
def me(token: str = Depends(get_current_user_info), db: Session = Depends(get_db)):
    """
    Returns user info from token. This endpoint assumes token payload carries user_id, username, email, role.
    """
    payload = token
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), token: dict = Depends(get_current_user_info)):
    """
    Admin-only: list all users. Token must carry role='admin'.
    """
    payload = token
    role = payload.get("role")
    if role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="admin access required")
    users = db.query(models.User).all()
    return users
