from pydantic import BaseModel

class PredictionInput(BaseModel):
    Study_Hours: float
    Age: int
    Avg_Daily_Usage_Hours: float
    Daily_Unlocks: int
    Physical_Activity_Hours: float
    Sleep_Hours_Per_Night: float
    Stress_Level: str
    Gender: str
    Academic_Level: str
    Most_Used_Platform: str
    Purpose_Of_Use: str
    Grouped_country: str