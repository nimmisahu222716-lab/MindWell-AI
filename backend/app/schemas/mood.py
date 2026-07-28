from pydantic import BaseModel

class MoodInput(BaseModel):
    mood: str
    stress_level: str
    note: str