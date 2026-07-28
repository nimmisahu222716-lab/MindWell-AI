from pydantic import BaseModel, Field

class PredictionInput(BaseModel):
    Study_Hours: float = Field(..., gt=0)
    Age: int = Field(..., gt=0)
    Avg_Daily_Usage_Hours: float = Field(..., gt=0)
    Daily_Unlocks: int = Field(..., gt=0)
    Physical_Activity_Hours: float = Field(..., gt=0)
    Sleep_Hours_Per_Night: float = Field(..., gt=0)
    Stress_Level: str
    Gender: str
    Academic_Level: str
    Most_Used_Platform: str
    Purpose_Of_Use: str
    Grouped_country: str