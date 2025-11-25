from scanner.extractor import extract_features
from utils.file_ops import move_to_quarantine
from utils.config_loader import AgentConfig
from utils.logger import log_info
from comms.api_client import APIClient

client = APIClient()

def scan_file(path):
    log_info(f"Scanning file: {path}")

    features, sha = extract_features(path)
    response = client.scan_file(features)

    if not response:
        log_info("Failed to get scan result.")
        return

    prob = response.get("probability", 0)

    if prob > 0.80:
        log_info(f"[MALWARE DETECTED] {path} — Score: {prob}")
        move_to_quarantine(path, AgentConfig.QUARANTINE_DIR)
    else:
        log_info(f"[SAFE] {path} — Score: {prob}")

    return prob
