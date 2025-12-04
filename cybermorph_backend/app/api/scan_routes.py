from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database import models
from app.schemas.scan import ScanResponse
from app.core.security import get_current_user_info
from app.core.config import get_settings
from app.utils.util import save_upload, sha256_of_file, build_features_deterministic
from app.core.malware import model, predict_malware
import os

router = APIRouter(prefix="/scan", tags=["scan"])

settings = get_settings()

# Optional JWT token reader
def get_optional_token(authorization: str | None = Header(default=None)):
    if authorization and authorization.startswith("Bearer "):
        return authorization.split(" ")[1]
    return None


@router.post("/upload", response_model=ScanResponse)
async def upload_and_scan(
    file: UploadFile = File(...),
    token: str | None = Depends(get_optional_token),
    db: Session = Depends(get_db)
):
    content = await file.read()
    filepath = save_upload(file.filename, content)
    file_hash = sha256_of_file(filepath)

    # Detect feature count
    try:
        expected = getattr(model, "n_features_", None)
        if expected is None:
            booster = getattr(model, "booster_", None)
            expected = len(booster.feature_name()) if booster else None
    except Exception:
        expected = None

    expected = expected or 2381  # fallback

    # deterministic feature builder
    features = build_features_deterministic(filepath, expected)

    try:
        score = predict_malware(features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

    verdict = "malicious" if score >= 0.5 else "benign"

    # Read user ID from JWT
    user_id = None
    if token:
        try:
            payload = get_current_user_info(token)
            user_id = payload.get("user_id")
        except Exception:
            user_id = None

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


@router.post("/features", response_model=ScanResponse)
def scan_from_features(
    payload: dict,
    token: str | None = Depends(get_optional_token),
    db: Session = Depends(get_db)
):
    vals = payload.get("values")
    filename = payload.get("filename", "uploaded_from_agent")

    if not vals or not isinstance(vals, (list, tuple)):
        raise HTTPException(status_code=400, detail="values must be a numeric list")

    try:
        score = predict_malware(vals)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

    verdict = "malicious" if score >= 0.5 else "benign"

    user_id = None
    if token:
        try:
            data = get_current_user_info(token)
            user_id = data.get("user_id")
        except Exception:
            user_id = None

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
