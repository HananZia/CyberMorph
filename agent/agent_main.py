import asyncio
from monitor.file_monitor import start_watcher
from monitor.process_monitor import monitor_processes
from monitor.system_watcher import monitor_system
from utils.logger import log_info

async def main():
    log_info("CyberMorph Agent Starting...")

    tasks = [
    start_watcher(),
    monitor_processes(),
    monitor_system()
]
    await asyncio.gather(*tasks)


if __name__ == "__main__":
    asyncio.run(main())
