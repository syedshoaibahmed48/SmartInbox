import uuid
from fastapi import APIRouter, HTTPException, Request
from pydantic import EmailStr
from services.redis_client import store_session
from services.oauth_flow import get_access_refresh_tokens, get_sso_url, is_valid_email

router = APIRouter()

@router.get("/sso")
async def return_sso_url(email: EmailStr):

    if not is_valid_email(email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    # Get SSO URL based on email provider (Currently supports Google and Microsoft accounts only)
    sso_url = get_sso_url(email)
    if sso_url == "unknown":
        raise HTTPException(status_code=400, detail="Unsupported email provider, the app currently supports Google and Microsoft accounts only.")
    
    return {"sso_url": sso_url}

@router.post("/token")
async def exchange_code(request: Request):
    data = await request.json()
    code = data.get("code")
    provider = data.get("provider")

    if not code or not provider:
        raise HTTPException(status_code=400, detail="Missing code or provider")
    
    token_details = get_access_refresh_tokens(provider, code)

    if token_details is None:
        raise HTTPException(status_code=400, detail="Failed to retrieve tokens from provider")

    # Generate a unique session ID
    sid = str(uuid.uuid4()) 

    # Store session in Redis
    session = store_session(sid, token_details)
    if not session:
        raise HTTPException(status_code=500, detail="Failed to store session")

    return {"sid": sid}