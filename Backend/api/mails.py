from fastapi import HTTPException, Request
from fastapi import APIRouter

from services.mails_service import get_user_details, get_user_mails
from services.sid_utils import decrypt_sid
from services.redis_client import get_session


router = APIRouter()

@router.get("")
async def get_mails(request: Request):
    try:
        # Extract parameters
        params = request.query_params
        count = params.get("count", 10)
        filter = params.get("filter", "all")

        # Get session from Redis
        sid = decrypt_sid(request.headers.get("X-Session-ID", ""))
        session = get_session(sid)

        # Get user details
        user_details = get_user_details(session.provider, session.access_token)
        if not user_details:
            raise HTTPException(status_code=500, detail="Failed to retrieve user details")
        
        # Get user mails
        user_mails = get_user_mails(session.provider, session.access_token, count=int(count), filter=filter)

        return {"user_details": user_details, "user_mails": user_mails}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}") from e