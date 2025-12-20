"""
File System Monitoring Module

This module provides file system monitoring capabilities that watch
for newly created executable files and automatically scan them for malware.
"""

import asyncio
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from scanner.local_scan import scan_file
from utils.config_loader import AgentConfig
from utils.logger import log_info
import os


# File System Event Handler
class FileHandler(FileSystemEventHandler):
    """
    Custom file system event handler for detecting new executable files.
    
    Monitors for file creation events and triggers scans for executable
    files with specific extensions (exe, dll, bin, scr, py, js).
    """

    def on_created(self, event):
        """
        Handle file creation events.
        
        Called when a new file is created in a monitored directory.
        Triggers malware scan for executable files.
        
        Args:
            event: FileSystemEvent object containing details about created file
        """
        # Skip directories - only process files
        if not event.is_directory:
            # Check if file has executable extension
            if event.src_path.lower().endswith((".exe", ".dll", ".bin", ".scr", ".py", ".js")):
                log_info(f"New file detected: {event.src_path}")
                
                # Schedule scan as async task
                asyncio.create_task(scan_file(event.src_path))


# File Watcher Functions
async def start_watcher():
    """
    Start monitoring configured directories for new files.
    
    Creates a watchdog observer and schedules FileHandler callbacks for
    each configured directory in AgentConfig.MONITOR_DIRS.
    Runs indefinitely until interrupted (Ctrl+C).
    """
    observer = Observer()
    handler = FileHandler()

    # Register file handler for each configured directory
    for directory in AgentConfig.MONITOR_DIRS:
        if os.path.exists(directory):
            observer.schedule(handler, directory, recursive=True)
            log_info(f"Watching: {directory}")

    # Start observer thread
    observer.start()
    
    try:
        # Keep watcher running indefinitely
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    
    # Wait for observer to complete shutdown
    observer.join()
