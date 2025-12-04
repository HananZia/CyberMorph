# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Import routers (each router keeps its own internal prefix, we'll mount under /api)
from app.api import auth_routes, user_routes, predict, file_scan, scan_routes, logs

from app.database.base import Base, engine
from app.core.config import get_settings

settings = get_settings()

# Create DB tables (idempotent)
Base.metadata.create_all(bind=engine)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cybermorph")

app = FastAPI(title="CyberMorph — AI Antivirus & Malware Detection")

# CORS: allow your Next.js dev server (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers under /api so endpoints become e.g. /api/auth/login, /api/scan/upload
app.include_router(auth_routes.router, prefix="/api")
app.include_router(user_routes.router, prefix="/api")
app.include_router(predict.router, prefix="/api")
app.include_router(file_scan.router, prefix="/api")
app.include_router(scan_routes.router, prefix="/api")
app.include_router(logs.router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "CyberMorph"}

@app.on_event("startup")
async def on_startup():
    logger.info("CyberMorph startup complete")
