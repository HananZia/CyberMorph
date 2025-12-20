import psutil
import os
import asyncio
from scanner.local_scan import scan_file
from utils.logger import log_info, log_error

# Suspicious keywords to identify potentially malicious processes
SUSPICIOUS_KEYWORDS = [
    "crack", "keygen", "patcher", "mal", "virus",
    "rat", "stealer", "loader", "inject", "spy"
]

# Check if a process is suspicious based on its name or executable path
def is_suspicious_process(proc):
    try:
        name = proc.name().lower()
        exe = proc.exe().lower()
        if any(k in name for k in SUSPICIOUS_KEYWORDS) or any(k in exe for k in SUSPICIOUS_KEYWORDS):
            return True
    except (psutil.AccessDenied, psutil.NoSuchProcess):
        return False
    return False

# Monitor Processes Continuously
async def monitor_processes():
    scanned = set()
    log_info("Process Monitor Started.")

    # Continuously monitor processes
    while True:
        try:
            for proc in psutil.process_iter(["pid", "name", "exe"]):
                if proc.pid in scanned:
                    continue
                if is_suspicious_process(proc):
                    exe = proc.info.get("exe")
                    if exe and os.path.exists(exe):
                        log_info(f"[PROCESS DETECTED] {proc.pid} - {proc.info['name']} => {exe}") # Log detected process
                        # Scan the executable file
                        prob = await scan_file(exe)
                        if prob and prob > 0.85:
                            log_info(f"Killing malware process: {proc.pid}")
                            proc.kill()
                        scanned.add(proc.pid)
        except Exception as e:
            log_error(f"Process monitor error: {e}")

        await asyncio.sleep(2) # Pause before next scan
