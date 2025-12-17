"""
Logging Module for Agent

This module provides logging configuration and convenience functions
for recording agent activities, errors, and important events to a log file.
"""

import logging
from utils.config_loader import AgentConfig

# ============================
# Logging Configuration
# ============================

# Ensure log directory exists
AgentConfig.ensure_dirs()

# Configure logging with file output
logging.basicConfig(
    filename=AgentConfig.LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s — %(levelname)s — %(message)s",
)

# ============================
# Logging Functions
# ============================


def log_info(message: str) -> None:
    """
    Log an informational message.
    
    Args:
        message: Message to log at INFO level
    """
    logging.info(message)


def log_error(message: str) -> None:
    """
    Log an error message.
    
    Args:
        message: Error message to log at ERROR level
    """
    logging.error(message)
