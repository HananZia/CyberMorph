# app/utils/util.py
import os
import hashlib
from app.core.config import get_settings
from typing import Tuple

settings = get_settings()

def save_upload(filename: str, content: bytes) -> str:
    """
    Save bytes to settings.UPLOAD_DIR and return absolute path.
    Filenames are not sanitized here: if you expect untrusted filenames,
    sanitize them (strip directories, etc.) before using.
    """
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_name = os.path.basename(filename)
    dest = os.path.join(settings.UPLOAD_DIR, safe_name)
    # write in binary mode
    with open(dest, "wb") as fh:
        fh.write(content)
    return dest

def sha256_of_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

# small feature builder (deterministic pseudo-random vector)
def build_features_deterministic(path: str, n_features: int) -> list:
    """
    Build a reproducible vector for model input based on file content.
    This is a placeholder for a real feature extractor — it produces
    deterministic pseudo-random floats seeded by the file's sha and size.
    """
    sha = sha256_of_file(path)
    file_size = os.path.getsize(path)
    # seed from sha and size
    seed = int(sha[:16], 16) ^ (file_size & 0xFFFFFFFF)
    import numpy as np
    rng = np.random.default_rng(seed)
    vec = rng.random(n_features).astype(float).tolist()
    return vec
