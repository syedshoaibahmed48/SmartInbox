from fastapi import APIRouter, HTTPException, Request
from pydantic import EmailStr
from services.oauth_flow import get_sso_url, is_valid_email

router = APIRouter()

@router.get("/sso")
async def return_sso_url(email: EmailStr):

    if not is_valid_email(email):
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Get SSO URL based on email provider
    # Currently supports Google and Microsoft accounts only
    sso_url = get_sso_url(email)
    if sso_url == "unknown":
        raise HTTPException(status_code=400, detail="Unsupported email provider, the app currently supports Google and Microsoft accounts only.")
    
    return {"sso_url": sso_url}
