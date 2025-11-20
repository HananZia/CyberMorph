import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_pretrained_model(model_name="EMBER_GBDT"):
    """
    Loads a pretrained ML model stored inside ml_lab/models/
    """

    model_path = os.path.join(BASE_DIR, "models", f"{model_name}.pkl")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Pretrained model not found: {model_path}")

    model = joblib.load(model_path)
    return model
