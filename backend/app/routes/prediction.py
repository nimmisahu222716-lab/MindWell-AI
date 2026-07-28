from fastapi import APIRouter, Depends

from app.schemas.prediction import PredictionInput
from app.services.prediction_service import predict_mental_health
from app.core.dependencies import get_current_user
from datetime import datetime
from app.core.database import history_collection
from bson import ObjectId
from statistics import mean
from app.services.insight_service import generate_insight

router = APIRouter(
    prefix="/predict",
    tags=["Prediction"]
)

@router.post("/")
def predict(
    data: PredictionInput,
    current_user: str = Depends(get_current_user)
):
    result = predict_mental_health(data.model_dump())
    insight = generate_insight(
    result,
    data.model_dump()
)

    history_collection.insert_one({
    "email": current_user,
    "input": data.model_dump(),
    "prediction": result,
    "risk_level": insight["risk_level"],
    "suggestions": insight["suggestions"],
    "created_at": datetime.utcnow()
})

    return {
    "user": current_user,
    "prediction": result,
    "risk_level": insight["risk_level"],
    "suggestions": insight["suggestions"]
}

@router.get("/history")
def get_history(
    current_user: str = Depends(get_current_user)
):
    history = list(
        history_collection.find(
            {"email": current_user},
            {"_id": 0}
        )
    )

    return history

@router.get("/dashboard")
def dashboard(
    current_user: str = Depends(get_current_user)
):
    predictions = list(
        history_collection.find(
            {"email": current_user},
            {"_id": 0}
        )
    )

    if not predictions:
        return {
            "user": current_user,
            "total_predictions": 0,
            "latest_prediction": None,
            "average_prediction": None
        }

    scores = [p["prediction"] for p in predictions]

    return {
        "user": current_user,
        "total_predictions": len(scores),
        "latest_prediction": scores[-1],
        "average_prediction": round(mean(scores), 2)
    }