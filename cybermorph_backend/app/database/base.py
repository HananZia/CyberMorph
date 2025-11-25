from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import get_settings

# ----------------------------
# Load settings
# ----------------------------
settings = get_settings()

# ----------------------------
# SQLAlchemy Base
# ----------------------------
Base = declarative_base()

# ----------------------------
# Engine
# ----------------------------
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# ----------------------------
# Session Local (for dependency injection)
# ----------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ----------------------------
# Dependency for FastAPI
# ----------------------------
def get_db():
    """
    Dependency that provides a database session.
    Usage in FastAPI endpoints:
        db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
