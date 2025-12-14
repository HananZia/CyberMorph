import os
import shutil
from utils.logger import log_info
import hashlib
import time

def move_to_quarantine(path, quarantine_dir):
    if not os.path.exists(path):
        return None

    filename = os.path.basename(path)
    sha = hashlib.sha256(open(path, "rb").read()).hexdigest()[:8]
    timestamp = int(time.time())
    dest_filename = f"{timestamp}_{sha}_{filename}"
    dest = os.path.join(quarantine_dir, dest_filename)

    try:
        shutil.move(path, dest)
        log_info(f"Moved to quarantine: {path} -> {dest}")
        return dest
    except Exception as e:
        log_info(f"Failed to move to quarantine: {e}")
        return None
