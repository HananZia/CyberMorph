import os
from datetime import timedelta
from functools import lru_cache
from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    # ----------------------------
    # JWT / Security
    # ----------------------------
    SECRET_KEY: str = Field(default_factory=lambda: os.getenv("CYBERMORPH_SECRET", "dev-secret-change-me"))
    ALGORITHM: str = Field(default_factory=lambda: os.getenv("JWT_ALGORITHM", "HS256"))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default_factory=lambda: int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")))

    # ----------------------------
    # File Upload / Storage
    # ----------------------------
    BASE_DIR: str = Field(default_factory=lambda: os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    UPLOAD_DIR: str = Field(default_factory=lambda: os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads"))

    # ----------------------------
    # Database
    # ----------------------------
    DATABASE_URL: str = Field(default_factory=lambda: os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'cybermorph.db')}"
    ))

    # ----------------------------
    # ML Model Path
    # ----------------------------
    MODEL_PATH: str = Field(
    default=r"F:\CyberMorph\cybermorph_backend\ml_lab\models\ember_model.joblib",
    env="MODEL_PATH"
)



    # ----------------------------
    # Quarantine / Logs
    # ----------------------------
    QUARANTINE_DIR: str = Field(default_factory=lambda: os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "quarantine"))

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    # ----------------------------
    # Helper Methods
    # ----------------------------
    def access_token_expires(self) -> timedelta:
        return timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)

    def ensure_dirs_exist(self):
        """Ensure all required directories exist."""
        for d in [self.UPLOAD_DIR, self.QUARANTINE_DIR]:
            os.makedirs(d, exist_ok=True)


# Singleton to avoid multiple loads
@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    settings.ensure_dirs_exist()
    if settings.SECRET_KEY == "dev-secret-change-me":
        print("Warning: SECRET_KEY is using default! Change it for production.")
    return settings
