from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.prediction import router as prediction_router
from app.routes.profile import router as profile_router
from app.routes import mood
from app.routes.report import router as report_router


app = FastAPI(title="MindWell AI API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(prediction_router)
app.include_router(mood.router)
app.include_router(profile_router)
app.include_router(report_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to MindWell AI"
    }