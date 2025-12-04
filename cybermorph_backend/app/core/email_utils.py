import smtplib
from email.mime.text import MIMEText

SMTP_USER = "user.cybermorph@gmail.com"
SMTP_PASS = "wxrxbvfznskdfgbe"

def send_recovery_email(email: str, code: str):
    msg = MIMEText(f"Your CyberMorph password reset code is: {code}")
    msg["Subject"] = "CyberMorph Password Recovery"
    msg["From"] = SMTP_USER
    msg["To"] = email

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(SMTP_USER, SMTP_PASS)
        smtp.sendmail(SMTP_USER, email, msg.as_string())
