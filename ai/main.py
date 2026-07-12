from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib

app = FastAPI()

model = joblib.load("model.pkl")
vehicle_encoder = joblib.load("vehicle_encoder.pkl")
risk_encoder = joblib.load("risk.pkl")

class Vehicle(BaseModel):
    vehicle_type: str
    vehicle_age_years: int
    odometer_km: int
    days_since_last_service: int
    previous_repairs: int
    avg_daily_distance_km: int
    fuel_efficiency_kmpl: float
    maintenance_cost_last_year: float

@app.post("/predict")
def predict(vehicle: Vehicle):

    data = vehicle.dict()

    data["vehicle_type"] = vehicle_encoder.transform(
        [data["vehicle_type"]]
    )[0]

    df = pd.DataFrame([data])

    prediction = model.predict(df)[0]

    risk = risk_encoder.inverse_transform([prediction])[0]

    probs = model.predict_proba(df)[0]

    confidence = round(max(probs) * 100, 2)

    if risk == "High":
        days = 10
    elif risk == "Medium":
        days = 25
    else:
        days = 50

    return {
        "maintenance_risk": risk,
        "confidence": confidence,
        "service_in_days": days
    }

@app.get("/")
def read_root():
    return {"message": "API is running!"}