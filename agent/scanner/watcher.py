import asyncio
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from scanner.local_scan import scan_file
from utils.config_loader import AgentConfig
from utils.logger import log_info
import os

# File System Event Handler
class FileHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory and event.src_path.lower().endswith((".exe", ".dll", ".bin", ".scr", ".py", ".js")):
            log_info(f"New file detected: {event.src_path}")
            asyncio.create_task(scan_file(event.src_path))

# File Watcher Functions
async def start_watcher():
    observer = Observer()
    handler = FileHandler()

    # Register file handler
    for directory in AgentConfig.MONITOR_DIRS:
        if os.path.exists(directory):
            observer.schedule(handler, directory, recursive=True)
            log_info(f"Watching: {directory}")

    # Start observer thread
    observer.start()
    try:
        while True:
            await asyncio.sleep(1)  #Proper async sleep
    except KeyboardInterrupt:
        observer.stop()
    finally:
        observer.join()
