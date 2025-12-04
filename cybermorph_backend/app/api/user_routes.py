# app/api/user_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from app.database.session import get_db
from app.database import models
from app.schemas.user import UserOut
from app.core.security import get_current_user_info

router = APIRouter(prefix="/user", tags=["Users"])

# --- Get current user info ---
@router.get("/me", response_model=UserOut)
def me(token_payload: dict = Depends(get_current_user_info), db: Session = Depends(get_db)):
    """
    Returns information about the currently logged-in user.
    """
    user_id = token_payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


# --- Admin-only: list all users ---
@router.get("/", response_model=List[UserOut])
def list_users(token_payload: dict = Depends(get_current_user_info), db: Session = Depends(get_db)):
    """
    Returns all users. Admin-only access.
    """
    role = token_payload.get("role")
    if role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    users = db.query(models.User).all()
    return users


# --- Admin-only: stats endpoint ---
@router.get("/stats", response_model=Dict)
def get_stats(token_payload: dict = Depends(get_current_user_info), db: Session = Depends(get_db)):
    """
    Returns basic statistics about users and scans. Admin-only.
    """
    role = token_payload.get("role")
    if role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    total_users = db.query(models.User).count()
    total_scans = db.query(models.ScanLog).count()
    threats = db.query(models.ScanLog).filter(models.ScanLog.verdict != "benign").count()

    return {
        "total_users": total_users,
        "total_scans": total_scans,
        "threats": threats
    }
