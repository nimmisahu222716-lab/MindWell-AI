from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends

from app.schemas.mood import MoodInput
from app.core.dependencies import get_current_user
from app.core.database import mood_collection
from fastapi.encoders import jsonable_encoder
from collections import Counter

router = APIRouter(
    prefix="/mood",
    tags=["Mood Tracker"]
)

@router.post("/")
def save_mood(
    data: MoodInput,
    current_user: str = Depends(get_current_user)
):

    mood_collection.insert_one({
        "email": current_user,
        "mood": data.mood.title(),
        "stress_level": data.stress_level.title(),
        "note": data.note,
        "created_at": datetime.now(ZoneInfo("Asia/Kolkata"))
    })

    return {
        "message": "Mood saved successfully"
    }

@router.get("/history")
def get_mood_history(
    current_user: str = Depends(get_current_user)
):
    moods = list(
        mood_collection.find(
            {"email": current_user},
            {"_id": 0}
        ).sort("created_at", -1)
    )

    return jsonable_encoder(moods)


@router.get("/analytics")
def mood_analytics(
    current_user: str = Depends(get_current_user)
):
    moods = list(
        mood_collection.find(
            {"email": current_user},
            {"_id": 0}
        )
    )

    stress_levels = [m["stress_level"] for m in moods]
    mood_levels = [m["mood"] for m in moods]

    return {
        "total_entries": len(moods),
        "stress_distribution": dict(Counter(stress_levels)),
        "mood_distribution": dict(Counter(mood_levels))
    }

@router.get("/stress-trend")
def stress_trend(
    current_user: str = Depends(get_current_user)
):
    moods = list(
        mood_collection.find(
            {"email": current_user},
            {
                "_id": 0,
                "stress_level": 1,
                "created_at": 1
            }
        ).sort("created_at", 1)
    )

    trend = []

    for mood in moods:
        trend.append({
            "date": mood["created_at"].strftime("%Y-%m-%d"),
            "stress_level": mood["stress_level"]
        })

    return trend

