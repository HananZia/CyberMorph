"""
Database Session Management

This module configures and provides database session handling for the application.
It creates a sessionmaker bound to the database engine and defines a FastAPI
dependency for injecting database sessions into routes.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from pathlib import Path
from app.core.config import get_settings

# ============================
# Configuration
# ============================

settings = get_settings()
DATABASE_URL = settings.DATABASE_URL

# ============================
# Database Engine
# ============================

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# ============================
# Session Factory
# ============================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ============================
# FastAPI Dependency
# ============================


def get_db() -> Session:
    """
    FastAPI dependency for database session injection.
    
    Creates a new database session for each request and ensures
    proper cleanup after the request completes.
    
    Yields:
        Session: SQLAlchemy database session
        
    Example:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
