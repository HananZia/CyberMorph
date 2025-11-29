# app/api/admin_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database import models
from app.schemas.user import UserOut
from app.schemas.scan import ScanResponse
from app.core.security import admin_required, get_current_user_info

router = APIRouter(prefix="/admin", tags=["admin"])


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


@router.get("/scans", response_model=List[ScanResponse])
def list_all_scans(db: Session = Depends(get_db), _p: Dict = Depends(admin_required)):
    scans = db.query(models.ScanLog).order_by(models.ScanLog.created_at.desc()).all()
    results = []
    for s in scans:
        results.append({
            "filename": s.filename,
            "verdict": s.verdict,
            "score": float(s.score) if s.score is not None else None,
            "details": s.details
        })
    return results


@router.delete("/scans/{scan_id}", status_code=204)
def delete_scan(scan_id: int, db: Session = Depends(get_db), _p: Dict = Depends(admin_required)):
    scan = db.query(models.ScanLog).filter(models.ScanLog.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan not found")
    db.delete(scan)
    db.commit()
    return {}


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


@router.get("/logs")
def get_logs(_p: Dict = Depends(admin_required)):
    """
    Basic convenience endpoint. For production, you may want to read a file or DB table.
    Here we return a simple message or an empty list placeholder.
    """
    # If you keep logs in files or DB, read them here and return structured data.
    return {"message": "Logs endpoint - implement reading from file or DB if needed", "logs": []}
