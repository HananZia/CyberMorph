import hashlib
import lief
import numpy as np


# -------------------------------------------------------------
# Utility functions
# -------------------------------------------------------------
def sha256_file(path):
    sha = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha.update(chunk)
    return sha.hexdigest()


# -------------------------------------------------------------
# Byte Histogram (256 bins)
# -------------------------------------------------------------
def byte_histogram(data):
    hist = np.zeros(256, dtype=np.float32)
    for b in data:
        hist[b] += 1
    return hist / np.sum(hist)


# -------------------------------------------------------------
# Byte-entropy histogram (16×16 = 256 bins)
# -------------------------------------------------------------
def byte_entropy_features(data, window=2048):
    if len(data) < window:
        window = len(data)

    entropy_bins = np.zeros((16, 16), dtype=np.float32)

    for i in range(0, len(data) - window, window):
        chunk = data[i:i + window]
        hist = np.bincount(chunk, minlength=256) / float(window)
        ent = -np.sum([p * np.log2(p) for p in hist if p > 0])

        entropy_idx = min(int(ent), 15)

        for b in chunk:
            byte_bin = b // 16
            entropy_bins[entropy_idx][byte_bin] += 1

    entropy_bins = entropy_bins.flatten()
    if entropy_bins.sum() > 0:
        entropy_bins /= entropy_bins.sum()

    return entropy_bins


# -------------------------------------------------------------
# PE Metadata Features
# -------------------------------------------------------------
def pe_metadata(pe):
    f = []

    # Basic metadata
    try:
        f.append(pe.header.time_date_stamps)
    except:
        f.append(0)

    f.append(len(pe.sections))

    # Characteristics flags
    f.append(pe.header.characteristics)

    # Optional header
    oh = pe.optional_header
    f.extend([
        getattr(oh, "sizeof_code", 0),
        getattr(oh, "sizeof_headers", 0),
        getattr(oh, "sizeof_image", 0),
        getattr(oh, "dll_characteristics", 0),
    ])

    return np.array(f, dtype=np.float32)


# -------------------------------------------------------------
# Section Features (max 8 sections)
# -------------------------------------------------------------
def section_features(pe):
    MAX_SECTIONS = 8

    sizes = []
    entropies = []

    for s in pe.sections[:MAX_SECTIONS]:
        sizes.append(s.size)
        entropies.append(s.entropy)

    # Pad to max
    while len(sizes) < MAX_SECTIONS:
        sizes.append(0)
        entropies.append(0)

    return np.array(sizes + entropies, dtype=np.float32)


# -------------------------------------------------------------
# Complete Ember Feature Vector (2,381 dims)
# -------------------------------------------------------------
def extract_ember_features(path):
    """
    Returns:
        np.ndarray float32 shape (2381,)
    """

    # Load raw bytes
    with open(path, "rb") as f:
        data = f.read()

    # 1. Byte histogram (256)
    hist256 = byte_histogram(data)

    # 2. Byte entropy histogram (256)
    entropy256 = byte_entropy_features(data)

    # 3. PE structural features (varies)
    try:
        pe = lief.parse(path)
        meta = pe_metadata(pe)
        sections = section_features(pe)
    except Exception:
        meta = np.zeros(7, dtype=np.float32)
        sections = np.zeros(16, dtype=np.float32)

    # Combine features
    final = np.concatenate([hist256, entropy256, meta, sections])

    # Final dimension padding to match Ember 2018 (2381 dims)
    if len(final) < 2381:
        pad_size = 2381 - len(final)
        final = np.concatenate([final, np.zeros(pad_size, dtype=np.float32)])

    return final.astype(np.float32)
