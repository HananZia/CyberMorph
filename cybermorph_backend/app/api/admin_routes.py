"""
Administrative API Routes

This module provides protected admin endpoints for managing:
- Users: listing and deletion
- Scans: listing and deletion
- Statistics: aggregate threat and scan data
- Alerts: recent malware detection alerts
- Logs: system and application logs

All endpoints require admin role authorization.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database import models
from app.schemas.user import UserOut
from app.schemas.scan import FileScanResult
from app.core.malware import alerts
from app.core.security import admin_required

router = APIRouter(prefix="/admin", tags=["admin"])

# ============================
# User Management Endpoints
# ============================


@router.get("/users", response_model=List[UserOut])
def list_all_users(db: Session = Depends(get_db), _authorization: Dict = Depends(admin_required)):
    """
    Get a list of all registered users.
    
    Args:
        db: Database session dependency
        _authorization: Admin authorization check dependency
        
    Returns:
        List[UserOut]: List of all user accounts
    """
    users = db.query(models.User).all()
    return users


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _authorization: Dict = Depends(admin_required)
):
    """
    Delete a user account by ID.
    
    Args:
        user_id: ID of the user to delete
        db: Database session dependency
        _authorization: Admin authorization check dependency
        
    Raises:
        HTTPException: If user not found (404)
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()


# ============================
# Scan Log Management Endpoints
# ============================


@router.get("/scans", response_model=List[Dict])
def list_all_scans(
    db: Session = Depends(get_db),
    _authorization: Dict = Depends(admin_required)
):
    """
    Get a list of all scan logs, ordered by most recent first.
    Ensures every scan has 'id' and serializable fields.
    """
    scans = db.query(models.ScanLog).order_by(
        models.ScanLog.created_at.desc()
    ).all()

    serialized_scans = []
    for s in scans:
        # Defensive check for missing ID
        if s.id is None:
            continue  # skip broken records

        serialized_scans.append({
            "id": s.id,
            "filename": s.filename,
            "verdict": s.verdict,
            "score": float(s.score) if s.score else 0.0,
            "details": s.details,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "malware_probability": float(s.score) if s.score else 0.0,
        })

    return serialized_scans


@router.delete("/scans/{scan_id}", status_code=204)
def delete_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    _authorization: Dict = Depends(admin_required)
):
    """
    Delete a scan log record by ID.
    
    Args:
        scan_id: ID of the scan record to delete
        db: Database session dependency
        _authorization: Admin authorization check dependency
        
    Raises:
        HTTPException: If scan not found (404)
    """
    scan = db.query(models.ScanLog).filter(
        models.ScanLog.id == scan_id
    ).first()
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    db.delete(scan)
    db.commit()


# ============================
# Statistics and Monitoring Endpoints
# ============================


@router.get("/stats", response_model=Dict)
def get_stats(
    db: Session = Depends(get_db),
    _authorization: Dict = Depends(admin_required)
):
    """
    Get aggregate security and user statistics.
    
    Provides high-level statistics including total scans performed,
    number of threats detected, and total registered users.
    
    Args:
        db: Database session dependency
        _authorization: Admin authorization check dependency
        
    Returns:
        Dict: Dictionary containing:
            - total_scans: Total number of scans performed
            - threats: Number of scans with non-benign verdict
            - users: Total number of registered users
    """
    total_scans = db.query(models.ScanLog).count()
    threat_count = db.query(models.ScanLog).filter(
        models.ScanLog.verdict != 'benign'
    ).count()
    total_users = db.query(models.User).count()
    
    return {
        "total_scans": total_scans,
        "threats": threat_count,
        "users": total_users
    }


# ============================
# Alert Management Endpoints
# ============================


@router.get("/alerts")
def get_alerts(_authorization: Dict = Depends(admin_required)):
    """
    Get recent malware detection alerts.
    
    Returns the last 20 malware detection alerts recorded in memory.
    
    Args:
        _authorization: Admin authorization check dependency
        
    Returns:
        List[Dict]: List of recent alerts with filename, probability, and status
    """
    return alerts[-20:]


# ============================
# Logs Endpoints
# ============================


@router.get("/logs")
def get_logs(_authorization: Dict = Depends(admin_required)):
    """
    Get application logs (stub endpoint).
    
    This endpoint is a placeholder for log retrieval functionality.
    In production, implement reading logs from file or database.
    
    Args:
        _authorization: Admin authorization check dependency
        
    Returns:
        Dict: Message indicating logs endpoint
    """
    return {
        "message": "Logs endpoint - implement reading from file or DB if needed",
        "logs": []
    }
