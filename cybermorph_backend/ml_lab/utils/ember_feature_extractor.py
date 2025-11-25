import json
import hashlib
import lief
import numpy as np

# EMBER uses 2351 features. You reduced to 512 via LightGBM internal.
# This extractor produces simplified 512-dim features.

class EmberFeatureExtractor:
    def __init__(self):
        pass

    def extract(self, file_path: str):
        try:
            binary = lief.parse(file_path)
        except Exception:
            return None

        if binary is None:
            return None

        features = []

        # ------------------------------
        # 1. File size
        # ------------------------------
        features.append(binary.virtual_size if binary.virtual_size else 0)

        # ------------------------------
        # 2. Hash Features
        # ------------------------------
        sha256 = hashlib.sha256(open(file_path, "rb").read()).digest()
        features.extend(list(sha256[:32]))  # 32 bytes

        # ------------------------------
        # 3. Header Features
        # ------------------------------
        features.append(binary.header.numberof_sections)

        # ------------------------------
        # 4. Each section size
        # ------------------------------
        for sec in binary.sections[:20]:
            features.append(sec.size)

        # pad to make fixed
        while len(features) < 512:
            features.append(0)

        return np.array(features[:512], dtype=float)
