import psutil
import os
import asyncio
from utils.config_loader import AgentConfig
from utils.logger import log_info, log_error
from scanner.local_scan import scan_file

# Thresholds for anomaly detection
CPU_THRESHOLD = 85       # percent
RAM_THRESHOLD = 85       # percent
FILE_CHANGE_THRESHOLD = 20  # number of file changes in monitored dirs per interval

# Track recent file creation/modifications
recent_files = {}

async def monitor_system():
    log_info("System Watcher Started.")

    while True:
        try:
            # CPU and RAM usage
            cpu = psutil.cpu_percent(interval=1)
            ram = psutil.virtual_memory().percent

            if cpu > CPU_THRESHOLD:
                log_info(f"High CPU usage detected: {cpu}%")
            if ram > RAM_THRESHOLD:
                log_info(f"High RAM usage detected: {ram}%")

            # Track file creation/modifications in monitored dirs
            total_changes = 0
            for directory in AgentConfig.MONITOR_DIRS:
                if not os.path.exists(directory):
                    continue

                for root, _, files in os.walk(directory):
                    for file in files:
                        path = os.path.join(root, file)
                        mtime = os.path.getmtime(path)
                        if path not in recent_files:
                            recent_files[path] = mtime
                        elif recent_files[path] != mtime:
                            recent_files[path] = mtime
                            total_changes += 1

            if total_changes > FILE_CHANGE_THRESHOLD:
                log_info(f"Mass file changes detected: {total_changes} files")

                # Optional: scan recently changed files
                for path in list(recent_files.keys())[-total_changes:]:
                    if os.path.exists(path):
                        asyncio.create_task(scan_file(path))

        except Exception as e:
            log_error(f"System monitor error: {e}")

        await asyncio.sleep(5)
