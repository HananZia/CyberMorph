from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from app.core.config import get_settings

settings = get_settings()

Base = declarative_base()
engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
