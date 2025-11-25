import os
import time
import hashlib
from scanner.local_scan import scan_file
from utils.logger import log_info
from utils.config_loader import AgentConfig

def hash_file(path):
    try:
        data = open(path, "rb").read()
        return hashlib.sha256(data).hexdigest()
    except:
        return None

def file_monitor():
    log_info("File Integrity Monitor Started.")

    tracked = {}

    while True:
        for directory in AgentConfig.MONITOR_DIRS:
            if not os.path.exists(directory):
                continue

            for root, _, files in os.walk(directory):
                for file in files:
                    if not file.lower().endswith((".exe", ".dll", ".py", ".js")):
                        continue

                    path = os.path.join(root, file)
                    current_hash = hash_file(path)

                    if not current_hash:
                        continue

                    # NEW FILE
                    if path not in tracked:
                        tracked[path] = current_hash
                        continue

                    # MODIFIED FILE
                    if tracked[path] != current_hash:
                        log_info(f"File modified: {path}")
                        scan_file(path)
                        tracked[path] = current_hash

        time.sleep(3)
