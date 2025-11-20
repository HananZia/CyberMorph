import os
from datetime import timedelta
from functools import lru_cache
from pydantic import BaseSettings

class Settings(BaseSettings):
    # JWT / Security
    SECRET_KEY: str = os.getenv("CYBERMORPH_SECRET", "dev-secret-change-me")
    ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    # Uploads / File Storage
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(os.path.dirname(BASE_DIR), 'cybermorph.db')}"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    # Helpers
    def access_token_expires(self) -> timedelta:
        return timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)

# Singleton pattern to avoid reloading env vars multiple times
@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    if settings.SECRET_KEY == "dev-secret-change-me":
        print("⚠️  Warning: SECRET_KEY is using default! Change it for production.")
    return settings
