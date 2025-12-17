"""
CyberMorph Agent Main Entry Point

This module initializes and runs the CyberMorph agent, which monitors
the system for new executable files and submits them to the backend
for malware detection analysis.

The agent runs three concurrent monitoring tasks:
1. File monitoring - watches for new files in configured directories
2. Process monitoring - monitors system processes
3. System monitoring - tracks overall system health and activity
"""

import asyncio
from monitor.file_monitor import start_watcher
from monitor.process_monitor import monitor_processes
from monitor.system_watcher import monitor_system
from utils.logger import log_info


async def main():
    """
    Main entry point for the CyberMorph agent.
    
    Initializes and runs three concurrent monitoring tasks:
    - File watcher for new executable files
    - Process monitor for running processes
    - System watcher for overall system activity
    
    All tasks run concurrently using asyncio.gather().
    """
    log_info("CyberMorph Agent Starting...")

    # Define monitoring tasks to run concurrently
    monitoring_tasks = [
        start_watcher(),
        monitor_processes(),
        monitor_system()
    ]
    
    # Run all monitoring tasks concurrently
    await asyncio.gather(*monitoring_tasks)


if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())
