import numpy as np
from .ember_feature_extractor import EmberFeatureExtractor

extractor = EmberFeatureExtractor()

def extract_features_from_file(path: str):
    features = extractor.extract(path)
    if features is None:
        raise ValueError("Feature extraction failed for file: " + path)
    return features.tolist()
