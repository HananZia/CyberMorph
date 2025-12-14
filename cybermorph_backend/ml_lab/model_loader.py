from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load model once when server starts
model = joblib.load("model/ember_model.joblib")
