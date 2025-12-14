import pefile

def is_pe_file(file_path):
    try:
        pefile.PE(file_path)
        return True
    except Exception:
        return False
