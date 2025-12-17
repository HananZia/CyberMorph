"""
Utility Functions for File Operations and Feature Engineering

This module provides helper functions for:
- Uploading and storing files
- Computing file hashes (SHA-256)
- Building deterministic feature vectors from files
"""

import os
import hashlib
from app.core.config import get_settings
from typing import List

settings = get_settings()

# ============================
# File Upload Functions
# ============================


def save_upload(filename: str, content: bytes) -> str:
    """
    Save uploaded file bytes to disk.
    
    Saves the file to settings.UPLOAD_DIR with its original filename.
    Note: Filenames are not sanitized here - if using untrusted filenames,
    sanitize them first (e.g., strip directory separators).
    
    Args:
        filename: Name of the file to save
        content: File content as bytes
        
    Returns:
        str: Absolute path to the saved file
    """
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Extract just the filename (remove any path components)
    safe_name = os.path.basename(filename)
    dest = os.path.join(settings.UPLOAD_DIR, safe_name)
    
    # Write file in binary mode
    with open(dest, "wb") as file_handle:
        file_handle.write(content)
    
    return dest


# ============================
# File Hashing Functions
# ============================


def sha256_of_file(file_path: str) -> str:
    """
    Compute SHA-256 hash of a file.
    
    Efficiently computes hash by reading file in chunks to avoid
    loading large files entirely into memory.
    
    Args:
        file_path: Path to file to hash
        
    Returns:
        str: Hexadecimal SHA-256 hash of file contents
    """
    hash_obj = hashlib.sha256()
    
    # Read in 64KB chunks for memory efficiency
    with open(file_path, "rb") as file_handle:
        for chunk in iter(lambda: file_handle.read(65536), b""):
            hash_obj.update(chunk)
    
    return hash_obj.hexdigest()


# ============================
# Feature Building Functions
# ============================


def build_features_deterministic(file_path: str, num_features: int) -> List[float]:
    """
    Build a reproducible feature vector from file content.
    
    Creates a deterministic pseudo-random feature vector seeded by the file's
    SHA-256 hash and size. This is a placeholder for a real feature extractor.
    In production, use EMBER or similar PE analysis tools for real features.
    
    Args:
        file_path: Path to the file to extract features from
        num_features: Number of features to generate in the vector
        
    Returns:
        List[float]: Feature vector as list of floats between 0.0 and 1.0
    """
    # Compute file hash and size for deterministic seeding
    file_hash = sha256_of_file(file_path)
    file_size = os.path.getsize(file_path)
    
    # Create seed from hash and size to ensure reproducibility
    # XOR first 16 hex digits of hash with file size
    seed = int(file_hash[:16], 16) ^ (file_size & 0xFFFFFFFF)
    
    # Generate deterministic pseudo-random features
    import numpy as np
    random_generator = np.random.default_rng(seed)
    feature_vector = random_generator.random(num_features).astype(float).tolist()
    
    return feature_vector
