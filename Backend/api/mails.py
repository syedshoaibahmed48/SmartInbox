from fastapi import HTTPException, Request
from fastapi import APIRouter

from services.mails_service import get_mail_thread, get_user_details, get_user_mails
from services.sid_utils import decrypt_sid
from services.redis_client import get_session, save_current_thread
from services.llm_service import format_thread_for_prompt


router = APIRouter()

@router.get("")
async def list_mails(request: Request):
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
    

@router.get("/{thread_id}")
async def get_thread(request: Request, thread_id: str):
    try:

        # Get session from Redis
        sid = decrypt_sid(request.headers.get("X-Session-ID", ""))
        session = get_session(sid)

        # Get user details
        user_details = get_user_details(session.provider, session.access_token)
        if not user_details:
            raise HTTPException(status_code=500, detail="Failed to retrieve user details")

        # Fetch email thread
        email_thread = get_mail_thread(session.provider, session.access_token, thread_id)
        
        save_current_thread(sid, email_thread)

        return {"email_thread": email_thread}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}") from e