"""
Application Configuration Module

This module defines all configuration settings for the CyberMorph application,
including JWT/security settings, file upload/storage paths, database URL,
ML model path, and other environment-dependent configurations.
"""

import os
from datetime import timedelta
from functools import lru_cache
from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    """
    Settings class for CyberMorph application configuration.
    
    Loads configuration from environment variables with sensible defaults.
    Supports .env file loading via Pydantic BaseSettings.
    """

    # ============================
    # JWT / Security Configuration
    # ============================
    SECRET_KEY: str = Field(
        default_factory=lambda: os.getenv("CYBERMORPH_SECRET", "dev-secret-change-me")
    )
    ALGORITHM: str = Field(
        default_factory=lambda: os.getenv("JWT_ALGORITHM", "HS256")
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default_factory=lambda: int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    )

    # ============================
    # File Upload / Storage Paths
    # ============================
    BASE_DIR: str = Field(
        default_factory=lambda: os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )
    )
    UPLOAD_DIR: str = Field(
        default_factory=lambda: os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "uploads"
        )
    )

    # ============================
    # Database Configuration
    # ============================
    DATABASE_URL: str = Field(
        default_factory=lambda: os.getenv(
            "DATABASE_URL",
            f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'cybermorph.db')}"
        )
    )

    # ============================
    # ML Model Configuration
    # ============================
    MODEL_PATH: str = Field(
        default=r"F:\CyberMorph\cybermorph_backend\ml_lab\models\ember_model.joblib",
        env="MODEL_PATH"
    )

    # ============================
    # Quarantine / Logs Configuration
    # ============================
    QUARANTINE_DIR: str = Field(
        default_factory=lambda: os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "quarantine"
        )
    )

    class Config:
        """Pydantic config for loading .env file."""
        env_file = ".env"
        env_file_encoding = "utf-8"

    # ============================
    # Helper Methods
    # ============================

    def access_token_expires(self) -> timedelta:
        """
        Calculate JWT access token expiration time.
        
        Returns:
            timedelta: Token expiration duration from current time
        """
        return timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)

    def ensure_dirs_exist(self):
        """
        Create required directories if they don't exist.
        
        Creates UPLOAD_DIR and QUARANTINE_DIR with parent directories
        as needed. This is a no-op if directories already exist.
        """
        for directory in [self.UPLOAD_DIR, self.QUARANTINE_DIR]:
            os.makedirs(directory, exist_ok=True)


# ============================
# Singleton Settings Factory
# ============================

@lru_cache()
def get_settings() -> Settings:
    """
    Get application settings singleton.
    
    Uses lru_cache to ensure only one Settings instance is created
    throughout the application lifecycle.
    
    Returns:
        Settings: Cached application configuration instance
        
    Raises:
        RuntimeWarning: If SECRET_KEY is using default development value
    """
    settings = Settings()
    settings.ensure_dirs_exist()
    
    # Warn if using default insecure secret key
    if settings.SECRET_KEY == "dev-secret-change-me":
        print("Warning: SECRET_KEY is using default! Change it for production.")
    
    return settings
