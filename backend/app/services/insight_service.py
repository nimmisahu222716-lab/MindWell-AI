def generate_insight(score: float, data: dict):

    suggestions = []

    # Risk Level
    if score < 4:
        risk = "Low"
    elif score < 7:
        risk = "Moderate"
    else:
        risk = "High"

    # Sleep
    if data["Sleep_Hours_Per_Night"] < 6:
        suggestions.append(
            "Try to sleep at least 7–8 hours every night."
        )

    # Physical Activity
    if data["Physical_Activity_Hours"] < 1:
        suggestions.append(
            "Increase your daily physical activity."
        )

    # Stress
    if data["Stress_Level"] == "High":
        suggestions.append(
            "Practice meditation or deep breathing to reduce stress."
        )

    # Social Media Usage
    if data["Avg_Daily_Usage_Hours"] > 8:
        suggestions.append(
            "Reduce your social media usage, especially before bedtime."
        )

    # Study Hours
    if data["Study_Hours"] < 2:
        suggestions.append(
            "Maintain a balanced study schedule."
        )

    if len(suggestions) == 0:
        suggestions.append(
            "Keep maintaining your healthy lifestyle."
        )

    return {
        "risk_level": risk,
        "suggestions": suggestions
    }