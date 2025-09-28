from fastapi import APIRouter

from Backend.services.redis_client import get_session


router = APIRouter()

@router.get("/mails")
async def get_mails(sid: str):
    # get session from redis using sid
    provider, access_token = get_session(sid)
    print(provider, access_token)

    # Fetch emails from the email provider's API


    return {"mails": []}