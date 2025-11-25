# app/api/logs.py
from fastapi import APIRouter
import os
from pathlib import Path
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()

@router.get("/logs")
def get_logs():
    logs_dir = Path(settings.BASE_DIR) / "logs"
    logs = []
    if logs_dir.exists():
        for f in os.listdir(logs_dir):
            logs.append(f)
    return {"logs": logs}
