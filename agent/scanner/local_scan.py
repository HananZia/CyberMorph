from scanner.extractor import extract_features
from utils.file_ops import move_to_quarantine
from utils.config_loader import AgentConfig
from utils.logger import log_info
from comms.api_client import APIClient
import asyncio

client = APIClient()

async def scan_file(path):
    log_info(f"Scanning file: {path}")

    features, sha = extract_features(path)
    if features is None:
        log_info(f"Failed to extract features: {path}")
        return None

    # Move to quarantine first
    quarantine_path = move_to_quarantine(path, AgentConfig.QUARANTINE_DIR)
    if not quarantine_path:
        return None

    response = await client.scan_file(features)
    if not response:
        log_info("Failed to get scan result.")
        return None

    prob = response.get("probability", 0)
    if prob > 0.80:
        log_info(f"[MALWARE DETECTED] {quarantine_path} — Score: {prob}")
    else:
        log_info(f"[SAFE] {quarantine_path} — Score: {prob}")
        # Optionally restore file if safe
        # move_back(quarantine_path, original_path)

    return prob
