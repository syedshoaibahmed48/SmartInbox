from fastapi import HTTPException, Request
from fastapi import APIRouter

from services.redis_client import get_current_thread
from services.sid_utils import decrypt_sid
from services.llm_service import get_llm_response

router = APIRouter()

@router.post("")
async def chat(request: Request):
    try:
        # Decrypt session ID
        sid = decrypt_sid(request.headers.get("X-Session-ID", ""))

        # get chat messages from request body
        data = await request.json()
        chatMessages = data.get("AIChatMessages", [])

        # get the current email thread
        current_thread = get_current_thread(sid)

        # Get LLM response
        llm_response = get_llm_response(current_thread, chatMessages)

        return {"llm_response": llm_response}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}") from e