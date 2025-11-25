import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from scanner.local_scan import scan_file
from utils.config_loader import AgentConfig
from utils.logger import log_info

class FileHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            if event.src_path.lower().endswith((".exe", ".dll", ".bin", ".scr", ".py", ".js")):
                log_info(f"New file detected: {event.src_path}")
                scan_file(event.src_path)

def start_watcher():
    observer = Observer()
    handler = FileHandler()

    for directory in AgentConfig.MONITOR_DIRS:
        if os.path.exists(directory):
            observer.schedule(handler, directory, recursive=True)
            log_info(f"Watching: {directory}")

    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()

    observer.join()
