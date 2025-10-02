from fastapi import HTTPException, Request
from fastapi import APIRouter

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

        return {"mails": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}") from e