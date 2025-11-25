import logging
from utils.config_loader import AgentConfig

AgentConfig.ensure_dirs()

logging.basicConfig(
    filename=AgentConfig.LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s — %(levelname)s — %(message)s",
)

def log_info(msg):
    logging.info(msg)

def log_error(msg):
    logging.error(msg)
