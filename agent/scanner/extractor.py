import os
import hashlib
import random

def extract_features(path):
    try:
        filesize = os.path.getsize(path)
        with open(path, "rb") as f:
            sha256 = hashlib.sha256(f.read()).hexdigest()
    except Exception as e:
        return None, None

    random.seed(filesize)
    features = [random.random() for _ in range(2381)]
    return features, sha256
