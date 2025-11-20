#!/usr/bin/env python3
"""
train.py

Train a LightGBM classifier on EMBER-style JSONL features.

Features per line expected:
  {"sha256": "...", "label": 0|1|-1, "features": [ ... ] , ...}

This script:
 - streams JSONL files (train_features_0..5.jsonl)
 - extracts only samples with label 0 or 1 (skip -1)
 - concatenates into arrays (optionally sample for speed)
 - performs train/validation split
 - trains LightGBM with early stopping
 - saves model as joblib and LightGBM text format

Author: CyberMorph assistant
"""

import os
import argparse
import json
from typing import Tuple, List
from pathlib import Path

import numpy as np
from tqdm import tqdm
from sklearn.model_selection import train_test_split
from lightgbm import LGBMClassifier
import joblib

# -------------------------
# Utilities
# -------------------------
def parse_args():
    p = argparse.ArgumentParser(description="Train LightGBM on EMBER JSONL features")
    p.add_argument("--data-dir", type=str, required=True,
                   help="Directory containing train_features_0..5.jsonl (EMBER)")
    p.add_argument("--out", type=str, default="ml_lab/models/ember_model_2018.joblib",
                   help="Output path for saved joblib model")
    p.add_argument("--out-lgb", type=str, default="ml_lab/models/ember_model_2018.txt",
                   help="Output path for LightGBM text model (optional)")
    p.add_argument("--n-estimators", type=int, default=500)
    p.add_argument("--num-leaves", type=int, default=512)
    p.add_argument("--learning-rate", type=float, default=0.05)
    p.add_argument("--val-size", type=float, default=0.1, help="Fraction for validation split")
    p.add_argument("--random-seed", type=int, default=42)
    p.add_argument("--sample-fraction", type=float, default=1.0,
                   help="If <1.0, randomly sample that fraction of known-labeled data for fast runs")
    p.add_argument("--max-rows", type=int, default=0,
                   help="If >0, stop after loading this many labeled rows (useful for testing)")
    p.add_argument("--quiet", action="store_true", help="Suppress non-essential prints")
    return p.parse_args()

def safe_float_array(lst):
    # ensure compact float32 numpy array
    return np.asarray(lst, dtype=np.float32)

def load_features_labels_from_file(path: Path, known_labels=(0,1),
                                   max_rows: int = 0) -> Tuple[List[List[float]], List[int]]:
    X = []
    y = []
    with open(path, "r", encoding="utf-8") as fh:
        for line_no, line in enumerate(fh, start=1):
            if not line.strip():
                continue
            try:
                obj = json.loads(line)
            except Exception:
                # malformed JSON line: skip
                continue

            # EMBER variations: either dict with "features" and "label", or other shapes.
            if isinstance(obj, dict):
                if "features" in obj and "label" in obj:
                    lbl = obj["label"]
                    if lbl in known_labels:
                        feats = obj["features"]
                        if isinstance(feats, list):
                            X.append(feats)
                            y.append(int(lbl))
                else:
                    # If dict but no keys we expect, try to find a list value
                    # scan for first list-looking key
                    found_feats = None
                    found_lbl = None
                    for k, v in obj.items():
                        if found_feats is None and isinstance(v, list):
                            found_feats = v
                        if found_lbl is None and isinstance(v, int):
                            # crude check: label key may be 'label'
                            if k.lower().startswith("label") or v in known_labels:
                                found_lbl = v
                    if found_feats is not None and found_lbl in known_labels:
                        X.append(found_feats)
                        y.append(int(found_lbl))
            elif isinstance(obj, list):
                # If line is a pure list, we cannot get label -> skip
                continue

            if max_rows and len(y) >= max_rows:
                break
    return X, y

# -------------------------
# Main training flow
# -------------------------
def main():
    args = parse_args()
    data_dir = Path(args.data_dir)
    out_path = Path(args.out)
    out_lgb = Path(args.out_lgb)

    if not args.quiet:
        print(f"[INFO] EMBER training script starting. Data dir: {data_dir}")
    if not data_dir.exists():
        raise FileNotFoundError(f"Data directory not found: {data_dir}")

    # discover train files (train_features_0..N.jsonl)
    train_files = sorted(data_dir.glob("train_features_*.jsonl"))
    if not train_files:
        # legacy name fallback
        f = data_dir / "train_features.jsonl"
        if f.exists():
            train_files = [f]
    if not train_files:
        raise FileNotFoundError("No train_features_*.jsonl files found in data dir")

    if not args.quiet:
        print(f"[INFO] Found {len(train_files)} train files. Loading...")

    X_parts = []
    y_parts = []
    total_loaded = 0

    for tf in train_files:
        if not args.quiet:
            print(f"[INFO] Loading {tf} ...")
        X_sub, y_sub = load_features_labels_from_file(tf, max_rows=(args.max_rows - total_loaded) if args.max_rows else 0)
        total_loaded += len(y_sub)
        if X_sub:
            X_parts.append(X_sub)
            y_parts.append(y_sub)
        if args.max_rows and total_loaded >= args.max_rows:
            break

    # Flatten lists
    if not X_parts:
        raise RuntimeError("No labeled training samples found (labels 0/1). Check files.")

    X = [item for part in X_parts for item in part]
    y = [lbl for part in y_parts for lbl in part]

    X = safe_float_array(X)
    y = np.asarray(y, dtype=np.int32)

    if not args.quiet:
        print(f"[INFO] Total labeled samples loaded: {len(y)}")
        print(f"[INFO] Feature vector dimension: {X.shape[1]}")

    # Optional sampling (for quick experiments)
    if args.sample_fraction < 1.0:
        if not args.quiet:
            print(f"[INFO] Sampling {args.sample_fraction*100:.2f}% of data for faster run")
        rng = np.random.default_rng(args.random_seed)
        idx = rng.choice(len(y), size=int(len(y)*args.sample_fraction), replace=False)
        X = X[idx]
        y = y[idx]

    # Train/validation split
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=args.val_size, random_state=args.random_seed, stratify=y
    )

    if not args.quiet:
        print(f"[INFO] Train samples: {len(y_train)}, Val samples: {len(y_val)}")

    # LightGBM classifier
    clf = LGBMClassifier(
        boosting_type="gbdt",
        objective="binary",
        num_leaves=args.num_leaves,
        learning_rate=args.learning_rate,
        n_estimators=args.n_estimators,
        n_jobs=-1,
        random_state=args.random_seed,
        verbose=-1
    )

    if not args.quiet:
        print("[INFO] Starting LightGBM fit with early stopping (eval metric: auc) ...")

    clf.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        eval_metric="auc",
        early_stopping_rounds=50,
        verbose=20
    )

    # Save joblib
    out_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(clf, out_path)
    if not args.quiet:
        print(f"[INFO] Joblib model saved to: {out_path}")

    # Also save LightGBM text model if requested
    try:
        if out_lgb:
            out_lgb.parent.mkdir(parents=True, exist_ok=True)
            clf.booster_.save_model(str(out_lgb))
            if not args.quiet:
                print(f"[INFO] LightGBM text model saved to: {out_lgb}")
    except Exception as e:
        print(f"[WARN] Could not save LightGBM text model: {e}")

    if not args.quiet:
        print("[DONE] Training finished successfully.")

if __name__ == "__main__":
    main()
