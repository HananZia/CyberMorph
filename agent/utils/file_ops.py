import shutil
import os
from utils.logger import log_info

def move_to_quarantine(path, quarantine_dir):
    if not os.path.exists(path):
        return False
    
    filename = os.path.basename(path)
    dest = os.path.join(quarantine_dir, filename)

    shutil.move(path, dest)
    log_info(f"Moved to quarantine: {path}")
    return True
