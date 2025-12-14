from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database import models
from app.schemas.user import UserOut
from app.schemas.scan import ScanResponse
from app.core.malware import alerts
from app.core.security import admin_required

router = APIRouter(prefix="/admin", tags=["admin"])

# ---- USERS ----
@router.get("/users", response_model=List[UserOut])
def list_all_users(db: Session = Depends(get_db), _p: Dict = Depends(admin_required)):
    users = db.query(models.User).all()
    return users

@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db), _p: Dict = Depends(admin_required)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return {}

# ---- SCANS ----
@router.get("/scans", response_model=List[ScanResponse])
def list_all_scans(db: Session = Depends(get_db), _p: Dict = Depends(admin_required)):
    scans = db.query(models.ScanLog).order_by(models.ScanLog.created_at.desc()).all()
    # Return SQLAlchemy objects directly so Pydantic can handle serialization
    return scans

@router.delete("/scans/{scan_id}", status_code=204)
def delete_scan(scan_id: int, db: Session = Depends(get_db), _p: Dict = Depends(admin_required)):
    scan = db.query(models.ScanLog).filter(models.ScanLog.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
    db.delete(scan)
    db.commit()
    return {}

# ---- STATS ----
@router.get("/stats", response_model=Dict)
def get_stats(db: Session = Depends(get_db), _p: Dict = Depends(admin_required)):
    total_scans = db.query(models.ScanLog).count()
    threats = db.query(models.ScanLog).filter(models.ScanLog.verdict != 'benign').count()
    total_users = db.query(models.User).count()
    return {
        "total_scans": total_scans,
        "threats": threats,
        "users": total_users
    }

# ---- ALERTS ----
@router.get("/alerts")
def get_alerts():
    return alerts[-20:]

# ---- LOGS ----
@router.get("/logs")
def get_logs(_p: Dict = Depends(admin_required)):
    return {"message": "Logs endpoint - implement reading from file or DB if needed", "logs": []}
