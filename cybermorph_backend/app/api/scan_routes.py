from fastapi import APIRouter, UploadFile, File
import os
import tempfile

from ml_lab.models.model_predict import predict_file

router = APIRouter(prefix="/scan")


@router.post("/file")
async def scan_file(file: UploadFile = File(...)):
    # Save temp file
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    # Run detection
    score, label = predict_file(tmp_path)

    os.remove(tmp_path)

    return {
        "file_name": file.filename,
        "malicious": bool(label),
        "score": score,
        "confidence": float(score if label else 1 - score),
    }
