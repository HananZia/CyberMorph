"""
File Operations Module

This module provides file system operations for quarantining suspicious files,
including moving files to a quarantine directory with timestamped and hashed
filenames for tracking and forensic analysis.
"""

import os
import shutil
import hashlib
import time
from utils.logger import log_info

# ============================
# File Quarantine Functions
# ============================


def move_to_quarantine(file_path: str, quarantine_directory: str) -> str:
    """
    Move a suspicious file to quarantine with a unique identifier.
    
    Moves the file to the quarantine directory and renames it with:
    - Current timestamp (Unix time)
    - First 8 characters of SHA-256 file hash
    - Original filename
    
    This naming scheme preserves file identity for forensic analysis
    while preventing name collisions.
    
    Args:
        file_path: Path to the file to quarantine
        quarantine_directory: Destination quarantine directory path
        
    Returns:
        str: Full path to the quarantined file, or None if move failed
    """
    # Verify source file exists
    if not os.path.exists(file_path):
        return None

    # Extract original filename
    original_filename = os.path.basename(file_path)
    
    # Calculate SHA-256 hash of file (first 8 chars for uniqueness)
    with open(file_path, "rb") as file_handle:
        file_hash = hashlib.sha256(file_handle.read()).hexdigest()[:8]
    
    # Generate quarantine filename with timestamp, hash, and original name
    current_timestamp = int(time.time())
    quarantined_filename = f"{current_timestamp}_{file_hash}_{original_filename}"
    quarantined_path = os.path.join(quarantine_directory, quarantined_filename)

    try:
        # Move file to quarantine
        shutil.move(file_path, quarantined_path)
        log_info(f"Moved to quarantine: {file_path} -> {quarantined_path}")
        return quarantined_path
    except Exception as error:
        log_info(f"Failed to move to quarantine: {error}")
        return None
