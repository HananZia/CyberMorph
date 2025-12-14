import httpx
import asyncio
from tenacity import retry, wait_exponential, stop_after_attempt
from utils.config_loader import AgentConfig
from utils.logger import log_info, log_error

class APIClient:
    def __init__(self):
        self.token = None
        self.client = httpx.AsyncClient(timeout=10)

    async def authenticate(self):
        try:
            res = await self.client.post(
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

    @retry(wait=wait_exponential(min=1, max=10), stop=stop_after_attempt(5))
    async def scan_file(self, features):
        if not self.token:
            await self.authenticate()

        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            res = await self.client.post(
                AgentConfig.BACKEND_URL + AgentConfig.API_PREDICT_ENDPOINT,
                json={"values": features},
                headers=headers
            )
            return res.json()
        except Exception as e:
            log_error(f"Scan API error: {e}")
            return None
