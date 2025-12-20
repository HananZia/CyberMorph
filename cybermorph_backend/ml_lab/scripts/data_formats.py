import os
import joblib
import lightgbm as lgb

model_path = os.path.join("F:", "CyberMorph", "cybermorph_backend", "ml_lab", "models", "ember_model_2018.txt")
# Save the LightGBM model in joblib format for faster loading in the future
joblib_path = os.path.join("ml_lab", "models", "ember_model.joblib")
model = lgb.Booster(model_file=model_path)
joblib.dump(model, joblib_path)
# Load
# model = joblib.load(joblib_path)
model = joblib.load(joblib_path)