import os
from app.core.config import UPLOAD_DIR
from pathlib import Path
import hashlib

def save_upload(filename: str, data: bytes) -> str:
    safe_name = Path(filename).name
    full_path = os.path.join(UPLOAD_DIR, safe_name)
    # Write bytes
    with open(full_path, "wb") as f:
        f.write(data)
    return full_path


def sha256_of_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(4096)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()
