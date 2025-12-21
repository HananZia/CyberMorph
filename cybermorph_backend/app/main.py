"""
CyberMorph FastAPI Application Entry Point

This module initializes and configures the FastAPI application for the CyberMorph
AI antivirus and malware detection service. It sets up middleware, API routers,
database initialization, and health check endpoints.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.database import init_db  # noqa: F401
from app.api.contact_routes import router as contact_router

# Import API route modules
from app.api import auth_routes, user_routes, predict, file_scan, scan_routes, logs, admin_routes

from app.database.base import Base, engine
from app.core.config import get_settings

# ============================
# Configuration and Setup
# ============================

settings = get_settings()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cybermorph")

# ============================
# FastAPI Application Setup
# ============================

app = FastAPI(title="CyberMorph — AI Based Antivirus & Malware Detection & Prevention System")

# ============================
# CORS Middleware Configuration
# ============================
# Allow Next.js frontend to communicate with the API in development.
# For production, restrict to actual frontend domain(s).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================
# API Routes Registration
# ============================
# All API routes are prefixed with /api, resulting in endpoints like:
# /api/auth/login, /api/auth/register, /api/scan/upload, etc.
app.include_router(auth_routes.router, prefix="/api")
app.include_router(user_routes.router, prefix="/api")
app.include_router(predict.router, prefix="/api")
app.include_router(file_scan.router, prefix="/api")
app.include_router(contact_router, prefix="/api")
app.include_router(scan_routes.router, prefix="/api")
app.include_router(logs.router, prefix="/api")
app.include_router(admin_routes.router, prefix="/api")

# ============================
# Health Check Endpoint
# ============================

@app.get("/health")
async def health_check():
    """Check if the API is running and healthy."""
    return {"status": "healthy", "service": "CyberMorph"}


# ============================
# Root Endpoint
# ============================

@app.get("/")
async def root():
    """Welcome message for API root endpoint."""
    return {"message": "Welcome to CyberMorph API"}


@app.get("/api/auth")
async def auth_endpoint():
    """Root auth endpoint returns welcome message."""
    return {"message": "Welcome to CyberMorph API"}


# ============================
# Startup Event Handler
# ============================

@app.on_event("startup")
async def on_startup():
    """
    Initialize the application on startup.
    Creates all database tables (idempotent operation).
    """
    Base.metadata.create_all(bind=engine)
    logger.info("CyberMorph startup complete")

