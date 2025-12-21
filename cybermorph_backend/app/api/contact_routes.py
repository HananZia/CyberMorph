from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.core.email_utils import send_contact_email  # import your email function

router = APIRouter()

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    message: str

@router.post("/contact")
async def contact_us(form: ContactForm):
    """
    Endpoint to handle Contact Us form submissions.
    Sends an email to user.cybermorph@gmail.com with the message.
    """
    try:
        send_contact_email(form.name, form.email, form.message)
        return {"message": "Email sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
