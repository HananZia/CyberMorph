# app/api/file_scan.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.malware import predict_malware
from pathlib import Path
from app.core.config import get_settings

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
    
    # TODO: extract features for this file (stub example)
    features = [0.0] * 512  # Replace with actual feature extraction
    malware_prob = predict_malware(features)
    
    return {"filename": file.filename, "malware_probability": malware_prob}
