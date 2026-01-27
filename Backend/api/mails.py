from fastapi import HTTPException, Request
from fastapi import APIRouter

from services.mails_service import fetch_mail_thread, fetch_user_details, fetch_user_mails
from services.sid_utils import decrypt_sid
from services.redis_client import get_current_view, get_mail_list, get_session, get_user_details, same_cached_filters, save_current_thread, save_current_view, save_mail_list, save_mail_list, save_user_details, session_has_mail_list, session_has_user_details

router = APIRouter()

@router.get("")
async def list_mails(request: Request):
    try:
        # Extract parameters
        params = request.query_params
        count = params.get("count", "25")
        filter = params.get("filter", "")

        # Get session from Redis
        sid = decrypt_sid(request.headers.get("X-Session-ID", ""))
        session = get_session(sid)

        # If not already cached, get and cache user details
        if not session_has_user_details(sid):
            user_details = fetch_user_details(session.provider, session.access_token)
            if not user_details:
                raise HTTPException(status_code=500, detail="Failed to retrieve user details")
            save_user_details(sid, user_details)
        else:
            user_details = get_user_details(sid)
        
        # fetch user mails list if required (filter changed or first load) and cache it or return cached version
        needs_fetch = (not session_has_mail_list(sid) or same_cached_filters(sid, filter, count) == False)

        if needs_fetch:
            user_mails = fetch_user_mails(session.provider, session.access_token, count=int(count), filter=filter)
            if user_mails is None:
                raise HTTPException(status_code=500, detail="Failed to retrieve user mails")
            save_current_view(sid, filter, count)
            save_mail_list(sid, user_mails)
        else:
            user_mails = get_mail_list(sid)

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
        user_details = fetch_user_details(session.provider, session.access_token)
        if not user_details:
            raise HTTPException(status_code=500, detail="Failed to retrieve user details")

        # Fetch email thread
        email_thread = fetch_mail_thread(session.provider, session.access_token, thread_id)
        
        save_current_thread(sid, email_thread)

        return {"email_thread": email_thread}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}") from e