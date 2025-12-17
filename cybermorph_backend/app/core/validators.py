"""
File Format Validation Module

This module provides validation utilities for checking if files conform
to expected binary formats, specifically for PE (Portable Executable) files.
"""

import pefile


def is_pe_file(file_path: str) -> bool:
    """
    Validate if a file is a valid PE (Portable Executable) binary.
    
    Attempts to parse the file as a PE executable. Returns True only if
    the file has a valid PE header structure.
    
    Args:
        file_path: Path to the file to validate
        
    Returns:
        bool: True if file is valid PE format, False otherwise
    """
    try:
        pefile.PE(file_path)
        return True
    except Exception:
        return False
