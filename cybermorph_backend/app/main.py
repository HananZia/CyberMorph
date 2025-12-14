# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Import routers
from app.api import auth_routes, user_routes, predict, file_scan, scan_routes, logs, admin_routes

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
app.include_router(admin_routes.router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "CyberMorph"}

@app.get("/")
async def root():
    return {"message": "Welcome to CyberMorph API"}

@app.get("/api/auth")
async def users():
    return {"message": "Welcome to CyberMorph API"}

@app.on_event("startup")
async def on_startup():
    logger.info("CyberMorph startup complete")

