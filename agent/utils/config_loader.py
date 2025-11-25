import os

class AgentConfig:
    BACKEND_URL = "http://127.0.0.1:8000"
    API_LOGIN_ENDPOINT = "/auth/login"
    API_PREDICT_ENDPOINT = "/predict"

    MONITOR_DIRS = [
        os.path.join(os.path.expanduser("~"), "Downloads"),
        os.path.join(os.path.expanduser("~"), "Desktop")
    ]

    QUARANTINE_DIR = os.path.join(os.getcwd(), "quarantine")
    LOG_FILE = os.path.join(os.getcwd(), "logs", "agent.log")

    USERNAME = "agent_user"
    PASSWORD = "agent_password"

    @staticmethod
    def ensure_dirs():
        os.makedirs(os.path.dirname(AgentConfig.LOG_FILE), exist_ok=True)
        os.makedirs(AgentConfig.QUARANTINE_DIR, exist_ok=True)
