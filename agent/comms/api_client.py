import requests
from utils.config_loader import AgentConfig
from utils.logger import log_info, log_error

class APIClient:
    def __init__(self):
        self.token = None

    def authenticate(self):
        try:
            res = requests.post(
                AgentConfig.BACKEND_URL + AgentConfig.API_LOGIN_ENDPOINT,
                json={"username": AgentConfig.USERNAME, "password": AgentConfig.PASSWORD}
            )
            if res.status_code == 200:
                self.token = res.json()["access_token"]
                log_info("Agent authenticated successfully.")
                return True
            log_error(f"Auth failed: {res.text}")
        except Exception as e:
            log_error(f"Auth error: {e}")
        return False

    def scan_file(self, features):
        if not self.token:
            self.authenticate()

        try:
            res = requests.post(
                AgentConfig.BACKEND_URL + AgentConfig.API_PREDICT_ENDPOINT,
                json={"values": features},
                headers={"Authorization": f"Bearer {self.token}"}
            )
            return res.json()
        except Exception as e:
            log_error(f"Scan API error: {e}")
            return None
