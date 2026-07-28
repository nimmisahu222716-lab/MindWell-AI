from io import BytesIO
from datetime import datetime
from collections import Counter
from statistics import mean

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)

from app.core.database import (
    users_collection,
    history_collection,
    mood_collection
)
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/report",
    tags=["PDF Report"]
)


@router.get("/pdf")
def download_report(
    current_user: str = Depends(get_current_user)
):

    # ---------------- USER ---------------- #

    user = users_collection.find_one(
        {"email": current_user},
        {"_id": 0, "password": 0}
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # ---------------- LATEST PREDICTION ---------------- #

    latest_prediction = history_collection.find_one(
        {"email": current_user},
        sort=[("created_at", -1)]
    )

    # ---------------- ALL PREDICTIONS ---------------- #

    predictions = list(
        history_collection.find(
            {"email": current_user},
            {"_id": 0}
        ).sort("created_at", -1)
    )

    scores = [p["prediction"] for p in predictions]

    average_score = round(mean(scores), 2) if scores else 0
    total_predictions = len(scores)

    # ---------------- MOODS ---------------- #

    moods = list(
        mood_collection.find(
            {"email": current_user},
            {"_id": 0}
        )
    )

    mood_distribution = Counter(
        mood["mood"] for mood in moods
    )

    stress_distribution = Counter(
        mood["stress_level"] for mood in moods
    )

    # ---------------- PDF ---------------- #

    buffer = BytesIO()

    doc = SimpleDocTemplate(buffer)

    styles = getSampleStyleSheet()

    story = []

    story.append(
        Paragraph(
            "<b>MindWell AI</b>",
            styles["Title"]
        )
    )

    story.append(
        Paragraph(
            "Mental Health Assessment Report",
            styles["Heading2"]
        )
    )

    story.append(
        Paragraph(
            f"Generated On: {datetime.now().strftime('%d %B %Y %I:%M %p')}",
            styles["Normal"]
        )
    )

    story.append(Spacer(1, 20))

    # ---------------- USER INFO ---------------- #

    story.append(
        Paragraph(
            "<b>User Information</b>",
            styles["Heading2"]
        )
    )

    story.append(
        Paragraph(
            f"Name: {user.get('full_name', 'N/A')}",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            f"Email: {user.get('email', 'N/A')}",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            f"Age: {user.get('age', 'N/A')}",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            f"Gender: {user.get('gender', 'N/A')}",
            styles["Normal"]
        )
    )

    story.append(Spacer(1, 15))

    # ---------------- DASHBOARD ---------------- #

    story.append(
        Paragraph(
            "<b>Prediction Summary</b>",
            styles["Heading2"]
        )
    )

    story.append(
        Paragraph(
            f"Total Predictions: {total_predictions}",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            f"Average Prediction: {average_score}",
            styles["Normal"]
        )
    )

    if latest_prediction:

        story.append(
            Paragraph(
                f"Latest Prediction: {latest_prediction['prediction']}",
                styles["Normal"]
            )
        )

        story.append(
            Paragraph(
                f"Risk Level: {latest_prediction['risk_level']}",
                styles["Normal"]
            )
        )

        story.append(
            Paragraph(
                "<b>Suggestions</b>",
                styles["Heading3"]
            )
        )

        for suggestion in latest_prediction["suggestions"]:

            story.append(
                Paragraph(
                    f"• {suggestion}",
                    styles["Normal"]
                )
            )

    story.append(Spacer(1, 15))

    # ---------------- MOOD SUMMARY ---------------- #

    story.append(
        Paragraph(
            "<b>Mood Summary</b>",
            styles["Heading2"]
        )
    )

    story.append(
        Paragraph(
            f"Total Mood Entries: {len(moods)}",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            "<b>Mood Distribution</b>",
            styles["Heading3"]
        )
    )

    for mood, count in mood_distribution.items():

        story.append(
            Paragraph(
                f"{mood}: {count}",
                styles["Normal"]
            )
        )

    story.append(
        Paragraph(
            "<b>Stress Distribution</b>",
            styles["Heading3"]
        )
    )

    for stress, count in stress_distribution.items():

        story.append(
            Paragraph(
                f"{stress}: {count}",
                styles["Normal"]
            )
        )

    # ---------------- BUILD PDF ---------------- #

    doc.build(story)

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            "attachment; filename=MindWell_Report.pdf"
        }
    )