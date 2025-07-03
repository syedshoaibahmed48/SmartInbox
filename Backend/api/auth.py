from fastapi import APIRouter, HTTPException, Request
from pydantic import EmailStr
from services.auth import is_valid_email

router = APIRouter()

@router.post("/sso")
async def return_sso_url(email: EmailStr):

    if not is_valid_email(email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Find the email domain

    domain = email.split('@')[1]

    known_patterns = {
        "google": ["google.com", "googlemail.com"],
        "microsoft": ["outlook.com", "protection.outlook.com"]
    }