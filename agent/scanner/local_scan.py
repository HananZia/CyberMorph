"""
Local File Scanning Module

This module provides scanning functionality that extracts features from
local files and submits them to the backend API for malware detection analysis.
Files flagged as malware are automatically moved to quarantine.
"""

from scanner.extractor import extract_features
from utils.file_ops import move_to_quarantine
from utils.config_loader import AgentConfig
from utils.logger import log_info
from comms.api_client import APIClient
import asyncio

# ============================
# API Client Setup
# ============================

client = APIClient()

# ============================
# File Scanning Functions
# ============================


async def scan_file(file_path: str) -> float:
    """
    Scan a file for malware detection.
    
    Extracts features from the file, moves it to quarantine, submits
    it to the backend API for analysis, and logs the result.
    
    Args:
        file_path: Path to the file to scan
        
    Returns:
        float: Malware probability score (0.0 to 1.0), or None if scan failed
    """
    log_info(f"Scanning file: {file_path}")

    # Extract features from file
    features, file_sha256 = extract_features(file_path)
    
    if features is None:
        log_info(f"Failed to extract features: {file_path}")
        return None

    # Move file to quarantine before analysis
    quarantine_path = move_to_quarantine(file_path, AgentConfig.QUARANTINE_DIR)
    if not quarantine_path:
        return None

    # Submit features to backend API for analysis
    response = await client.scan_file(features)
    if not response:
        log_info("Failed to get scan result.")
        return None

    # Extract probability from response
    malware_probability = response.get("probability", 0)
    
    # Log results with threat level
    if malware_probability > 0.80:
        log_info(f"[MALWARE DETECTED] {quarantine_path} — Score: {malware_probability}")
    else:
        log_info(f"[SAFE] {quarantine_path} — Score: {malware_probability}")
        # NOTE: To restore safe files from quarantine, uncomment:
        # move_back(quarantine_path, original_path)

    return malware_probability
