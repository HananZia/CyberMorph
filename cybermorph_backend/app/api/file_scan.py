from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil
import os
import logging

from app.core.config import get_settings
from app.core.malware import predict_malware
from app.core.validators import is_pe_file

router = APIRouter()
settings = get_settings()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
QUARANTINE_DIR = Path(settings.UPLOAD_DIR) / "quarantine"
QUARANTINE_DIR.mkdir(parents=True, exist_ok=True)

# ----------------------------
# Logger for detections
# ----------------------------
logging.basicConfig(
    filename="detections.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
detection_logger = logging.getLogger("detections")


@router.post("/scan")
async def scan_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_path = upload_dir / file.filename

    try:
        # Save file safely
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # File size validation
        if file_path.stat().st_size > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large")

        # PE validation
        if not is_pe_file(file_path):
            raise HTTPException(status_code=400, detail="Invalid PE file")

        # Malware prediction
        malware_prob = predict_malware(str(file_path))

        # ----------------------------
        # Decision tiers
        # ----------------------------
        if malware_prob >= 0.8:
            status = "high-risk malware"
        elif malware_prob >= 0.5:
            status = "suspicious"
        else:
            status = "benign"

        # ----------------------------
        # Logging / Detection
        # ----------------------------
        if status != "benign":
            detection_logger.warning(
                f"Malware detected: {file.filename} | Score={malware_prob} | Status={status}"
            )

        # ----------------------------
        # Quarantine handling
        # ----------------------------
        if status != "benign":
            shutil.move(file_path, QUARANTINE_DIR / file.filename)
        else:
            os.remove(file_path)

        return {
            "filename": file.filename,
            "malware_probability": round(float(malware_prob), 4),
            "status": status
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

