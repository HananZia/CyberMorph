import os
import json
import numpy as np

DATA_DIR = r"F:\CyberMorph\cybermorph_backend\ml_lab\datasets\ember2018"

def load_features():
    X_list = []
    y_list = []

    for fname in os.listdir(DATA_DIR):
        if not fname.endswith(".jsonl"):
            continue
        path = os.path.join(DATA_DIR, fname)
        print(f"Reading: {path}")
        with open(path, "r") as f:
            for line in f:
                sample = json.loads(line)
                # Extract all keys except label as features
                features = [v for k, v in sample.items() if k != "malware"]
                X_list.append(features)
                # Label is 'malware' key
                y_list.append(sample.get('malware', 0))

    X = np.array(X_list, dtype=float)
    y = np.array(y_list, dtype=int)
    print(f"Loaded {X.shape[0]} samples with {X.shape[1] if X.shape[0] > 0 else 0} features")
    return X, y

if __name__ == "__main__":
    X, y = load_features()
    print(X.shape, y.shape)
