import joblib
import pandas as pd
from pathlib import Path

MODEL_PATH = Path("model") / "Mental_Health_Model.pkl"

model = joblib.load(MODEL_PATH)


def predict_mental_health(data: dict):
    df = pd.DataFrame([data])
    prediction = model.predict(df)

    return float(prediction[0])