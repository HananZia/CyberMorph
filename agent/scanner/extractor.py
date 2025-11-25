import os
import hashlib
import random

def extract_features(path):
    filesize = os.path.getsize(path)
    sha256 = hashlib.sha256(open(path, "rb").read()).hexdigest()

    # Dummy 2381-length Ember-like vector
    random.seed(filesize)
    features = [random.random() for _ in range(2381)]

    return features, sha256
