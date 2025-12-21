"""
Email Notification Module

This module provides email functionality for sending password recovery
and verification codes to users during the account recovery process.
"""

import smtplib
from email.mime.text import MIMEText

# ============================
# SMTP Configuration
# ============================

# Email credentials for sending recovery emails
SMTP_USER = "user.cybermorph@gmail.com"
SMTP_PASS = "wxrxbvfznskdfgbe"

# SMTP server configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465


def send_recovery_email(recipient_email: str, verification_code: str) -> None:
    """
    Send password recovery email with verification code.
    
    Sends a formatted email containing a 6-digit verification code
    to the user's registered email address using Gmail SMTP.
    
    Args:
        recipient_email: Email address to send recovery code to
        verification_code: 6-digit code for password reset verification
        
    Raises:
        smtplib.SMTPException: If email sending fails
    """
    # Create email message
    message = MIMEText(f"Your CyberMorph password reset code is: {verification_code}")
    message["Subject"] = "CyberMorph Password Recovery"
    message["From"] = SMTP_USER
    message["To"] = recipient_email

    # Send via Gmail SMTP with SSL/TLS
    with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as smtp_connection:
        smtp_connection.login(SMTP_USER, SMTP_PASS)
        smtp_connection.sendmail(SMTP_USER, recipient_email, message.as_string())

def send_contact_email(sender_name: str, sender_email: str, message_content: str) -> None:
    """
    Sends a contact form message to CyberMorph support email.
    """
    body = f"""
    New Contact Form Submission:

    Name: {sender_name}
    Email: {sender_email}

    Message:
    {message_content}
    """

    message = MIMEText(body)
    message["Subject"] = "CyberMorph Contact Form Submission"
    message["From"] = SMTP_USER
    message["To"] = SMTP_USER  # send to your own email

    with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as smtp:
        smtp.login(SMTP_USER, SMTP_PASS)
        smtp.sendmail(SMTP_USER, SMTP_USER, message.as_string())