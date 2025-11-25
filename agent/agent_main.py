import threading
from monitor.system_watcher import start_watcher
from monitor.file_monitor import file_monitor
from monitor.process_monitor import monitor_processes
from utils.logger import log_info

def main():
    log_info("CyberMorph Agent Starting...")

    t1 = threading.Thread(target=start_watcher, daemon=True)
    t2 = threading.Thread(target=file_monitor, daemon=True)
    t3 = threading.Thread(target=monitor_processes, daemon=True)

    t1.start()
    t2.start()
    t3.start()

    log_info("All monitoring modules started.")

    t1.join()
    t2.join()
    t3.join()

if __name__ == "__main__":
    main()
