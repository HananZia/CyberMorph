"""
Agent Configuration Loader

This module provides the AgentConfig class which manages all configuration
settings for the CyberMorph agent, including API endpoints, monitoring
directories, authentication credentials, and log file paths.
"""

import os

# ============================
# Agent Configuration
# ============================


class AgentConfig:
    """
    Central configuration class for the CyberMorph agent.
    
    Manages:
    - Backend API connection settings
    - Directories to monitor for suspicious files
    - Quarantine directory for flagged files
    - Logging configuration
    - Authentication credentials
    
    Attributes:
        BACKEND_URL: Base URL for backend API
        API_LOGIN_ENDPOINT: Endpoint path for API authentication
        API_PREDICT_ENDPOINT: Endpoint path for malware prediction
        MONITOR_DIRS: List of directories to monitor for new files
        QUARANTINE_DIR: Directory where flagged files are stored
        LOG_FILE: Path to agent log file
        USERNAME: Agent username for backend authentication
        PASSWORD: Agent password for backend authentication
    """
    
    # ============================
    # Backend API Configuration
    # ============================
    
    BACKEND_URL = "http://127.0.0.1:8000"
    API_LOGIN_ENDPOINT = "/auth/login"
    API_PREDICT_ENDPOINT = "/predict"

    # ============================
    # File Monitoring Configuration
    # ============================
    
    MONITOR_DIRS = [
        os.path.join(os.path.expanduser("~"), "Downloads"),
        os.path.join(os.path.expanduser("~"), "Desktop")
    ]

    # ============================
    # Quarantine Configuration
    # ============================
    
    QUARANTINE_DIR = os.path.join(os.getcwd(), "quarantine")
    
    # ============================
    # Logging Configuration
    # ============================
    
    LOG_FILE = os.path.join(os.getcwd(), "logs", "agent.log")

    # ============================
    # Authentication Configuration
    # ============================
    
    USERNAME = os.environ.get("AGENT_USERNAME", "agent_user")
    PASSWORD = os.environ.get("AGENT_PASSWORD", "agent_password")

    # ============================
    # Helper Methods
    # ============================

    @staticmethod
    def ensure_dirs():
        """
        Create necessary directories if they don't exist.
        
        Ensures that log directory and quarantine directory are created
        with any necessary parent directories.
        """
        os.makedirs(os.path.dirname(AgentConfig.LOG_FILE), exist_ok=True)
        os.makedirs(AgentConfig.QUARANTINE_DIR, exist_ok=True)
