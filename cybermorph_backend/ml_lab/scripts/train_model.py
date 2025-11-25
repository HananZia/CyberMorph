import json
import numpy as np
from lightgbm import LGBMClassifier
import joblib
from glob import glob

dataset_path = r"F:\CyberMorph\cybermorph_backend\ml_lab\datasets\ember2018"

def extract_features(data):
    return data["histogram"] + data["byteentropy"], data["label"]

def load_jsonl_chunk(file_path, chunk_size=10000):
    features, labels = [], []
    with open(file_path, "r") as f:
        for line in f:
            feat, lab = extract_features(json.loads(line))
            features.append(feat)
            labels.append(lab)
            if len(features) >= chunk_size:
                yield np.array(features), np.array(labels)
                features, labels = [], []
        if features:
            yield np.array(features), np.array(labels)

# Initialize model
model = LGBMClassifier(n_estimators=100)

train_files = sorted(glob(f"{dataset_path}/train_features_*.jsonl"))
first_chunk = True

for file in train_files:
    print(f"Processing {file} ...")
    for X_chunk, y_chunk in load_jsonl_chunk(file):
        # Skip chunks with only one class
        if len(np.unique(y_chunk)) < 2:
            continue
        if first_chunk:
            model.fit(X_chunk, y_chunk)
            first_chunk = False
        else:
            model.fit(X_chunk, y_chunk, init_model=model)

# Save trained model
joblib.dump(model, r"F:\CyberMorph\cybermorph_backend\ml_lab\models\ember_model_2018.pkl")

print("Memory-efficient model trained and saved successfully.")
