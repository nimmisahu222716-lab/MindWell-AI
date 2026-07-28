import os
import smtplib

from dotenv import load_dotenv
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()

EMAIL = os.getenv("EMAIL_USER")
PASSWORD = os.getenv("EMAIL_PASS")


def send_otp_email(receiver_email: str, otp: str):

    subject = "MindWell AI - Email Verification OTP"

    body = f"""
Hello,

Welcome to MindWell AI.

Your verification OTP is:

{otp}

This OTP is valid for 5 minutes.

If you didn't request this, please ignore this email.

Regards,
MindWell AI Team
"""

    message = MIMEMultipart()

    message["From"] = EMAIL
    message["To"] = receiver_email
    message["Subject"] = subject

    message.attach(MIMEText(body, "plain"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(EMAIL, PASSWORD)
        server.send_message(message)