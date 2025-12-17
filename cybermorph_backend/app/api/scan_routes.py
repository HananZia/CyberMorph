"""
File Scanning API Routes

This module provides endpoints for scanning files for malware detection.
Supports two scanning modes:
1. File upload scanning: Upload PE binary file and get instant analysis
2. Feature vector scanning: Submit pre-extracted feature vectors
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database import models
from app.schemas.scan import FileScanResult
from app.core.security import get_current_user_info
from app.core.config import get_settings
from app.utils.util import save_upload, sha256_of_file, build_features_deterministic
from app.core.malware import model, predict_malware
import os

router = APIRouter(prefix="/scan", tags=["scan"])

settings = get_settings()

# ============================
# Helper Functions
# ============================


def get_optional_token(authorization: str | None = Header(default=None)) -> str | None:
    """
    Extract optional JWT token from Authorization header.
    
    Allows anonymous scans while supporting authenticated scans when token provided.
    
    Args:
        authorization: Authorization header value (e.g., "Bearer <token>")
        
    Returns:
        str or None: Extracted token or None if not present
    """
    if authorization and authorization.startswith("Bearer "):
        return authorization.split(" ")[1]
    return None

# ============================
# File Scanning Endpoints
# ============================


@router.post("/upload", response_model=FileScanResult)
async def upload_and_scan(
    file: UploadFile = File(...),
    token: str | None = Depends(get_optional_token),
    db: Session = Depends(get_db)
):
    """
    Upload and scan a PE file for malware.
    
    Accepts a file upload, extracts features, runs malware prediction,
    and records the scan result in the database.
    
    Args:
        file: PE binary file to scan
        token: Optional JWT token for authenticated users
        db: Database session dependency
        
    Returns:
        FileScanResult: File name, verdict (malicious/benign), prediction score, and details
        
    Raises:
        HTTPException: If prediction fails (500)
    """
    # Read uploaded file content
    content = await file.read()
    filepath = save_upload(file.filename, content)
    file_hash = sha256_of_file(filepath)

    # Detect expected feature count from trained model
    expected_features = None
    try:
        # Try to get feature count from sklearn models
        expected_features = getattr(model, "n_features_", None)
        
        # Fallback for XGBoost models
        if expected_features is None:
            booster = getattr(model, "booster_", None)
            expected_features = len(booster.feature_name()) if booster else None
    except Exception:
        # If detection fails, use fallback
        expected_features = None

    # Use fallback feature count if detection failed
    expected_features = expected_features or 2381

    # Extract deterministic features from file
    features = build_features_deterministic(filepath, expected_features)

    # Run malware prediction
    try:
        score = predict_malware(features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

    # Determine verdict based on threshold
    verdict = "malicious" if score >= 0.5 else "benign"

    # Extract user ID from JWT if authenticated
    user_id = None
    if token:
        try:
            payload = get_current_user_info(token)
            user_id = payload.get("user_id")
        except Exception:
            # If token parsing fails, treat as anonymous scan
            user_id = None

    # Record scan in database
    scan = models.ScanLog(
        user_id=user_id,
        filename=file.filename,
        filepath=filepath,
        sha256=file_hash,
        verdict=verdict,
        score=str(score),
        details="auto-scanned using deterministic features",
    )

    db.add(scan)
    db.commit()
    db.refresh(scan)

    return {
        "filename": file.filename,
        "verdict": verdict,
        "score": score,
        "details": scan.details,
    }


@router.post("/features", response_model=FileScanResult)
def scan_from_features(
    payload: dict,
    token: str | None = Depends(get_optional_token),
    db: Session = Depends(get_db)
):
    """
    Scan from pre-extracted feature vector.
    
    Accepts a feature vector payload instead of a file, useful for
    agents or clients that already extracted features. Runs prediction
    and records the scan in the database.
    
    Args:
        payload: Request body containing:
                - values: List of numeric features
                - filename: Optional filename (defaults to "uploaded_from_agent")
        token: Optional JWT token for authenticated users
        db: Database session dependency
        
    Returns:
        FileScanResult: File name, verdict (malicious/benign), prediction score, and details
        
    Raises:
        HTTPException: If values not provided/invalid (400) or prediction fails (500)
    """
    # Extract payload fields
    feature_values = payload.get("values")
    filename = payload.get("filename", "uploaded_from_agent")

    # Validate feature values
    if not feature_values or not isinstance(feature_values, (list, tuple)):
        raise HTTPException(status_code=400, detail="values must be a numeric list")

    # Run malware prediction
    try:
        score = predict_malware(feature_values)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

    # Determine verdict based on threshold
    verdict = "malicious" if score >= 0.5 else "benign"

    # Extract user ID from JWT if authenticated
    user_id = None
    if token:
        try:
            user_info = get_current_user_info(token)
            user_id = user_info.get("user_id")
        except Exception:
            # If token parsing fails, treat as anonymous scan
            user_id = None

    # Record scan in database
    scan = models.ScanLog(
        user_id=user_id,
        filename=filename,
        filepath="(features-only)",
        sha256=None,
        verdict=verdict,
        score=str(score),
        details="scanned from features payload"
    )

    db.add(scan)
    db.commit()
    db.refresh(scan)

    return {
        "filename": filename,
        "verdict": verdict,
        "score": score,
        "details": scan.details,
    }
