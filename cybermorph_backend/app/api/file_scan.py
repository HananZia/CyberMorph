# app/api/file_scan.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
from app.core.config import get_settings
from app.core.malware import predict_malware

router = APIRouter()
settings = get_settings()

@router.post("/scan")
async def scan_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    # Save uploaded file temporarily
    upload_path = Path(settings.UPLOAD_DIR) / file.filename
    with open(upload_path, "wb") as f:
        f.write(await file.read())

    try:
        malware_prob = predict_malware(str(upload_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    status = "malicious" if malware_prob >= 0.5 else "benign"
    return {
        "filename": file.filename,
        "malware_probability": malware_prob,
        "status": status
    }
