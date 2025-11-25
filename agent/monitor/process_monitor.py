import psutil
import time
import os
from scanner.local_scan import scan_file
from utils.logger import log_info, log_error

SUSPICIOUS_KEYWORDS = [
    "crack", "keygen", "patcher", "mal", "virus",
    "rat", "stealer", "loader", "inject", "spy"
]

def is_suspicious_process(proc):
    try:
        name = proc.name().lower()
        exe = proc.exe().lower()

        if any(keyword in name for keyword in SUSPICIOUS_KEYWORDS):
            return True
        if any(keyword in exe for keyword in SUSPICIOUS_KEYWORDS):
            return True

        if exe.endswith((".exe", ".dll")):
            return True

    except:
        return False

    return False

def monitor_processes():
    log_info("Process Monitor Started.")

    scanned = set()

    while True:
        try:
            for proc in psutil.process_iter(["pid", "name", "exe"]):

                if proc.pid in scanned:
                    continue

                if is_suspicious_process(proc):
                    exe = proc.info.get("exe")

                    if exe and os.path.exists(exe):
                        log_info(f"[PROCESS DETECTED] {proc.pid} - {proc.info['name']} => {exe}")

                        prob = scan_file(exe)

                        if prob and prob > 0.85:
                            log_info(f"Killing malware process: {proc.pid}")
                            proc.kill()

                        scanned.add(proc.pid)
        except Exception as e:
            log_error(f"Process monitor error: {e}")

        time.sleep(2)
