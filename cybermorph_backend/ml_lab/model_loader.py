import requests
from pathlib import Path

# === CONFIGURATION ===
MODEL_URL = "https://raw.githubusercontent.com/username/repo/branch/path/to/ann_model.keras"
SAVE_DIR = Path("F:/CyberMorph/cybermorph_backend/ml_lab/models")  # your desired folder
SAVE_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = SAVE_DIR / "ann_model.keras"

# === DOWNLOAD MODEL ===
try:
    response = requests.get(MODEL_URL)
    response.raise_for_status()  # raise error if download fails
    with open(MODEL_PATH, "wb") as f:
        f.write(response.content)
    print(f"Model downloaded successfully to: {MODEL_PATH}")
except Exception as e:
    print(f"Failed to download model: {e}")
