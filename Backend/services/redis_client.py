import json
import redis
import os

from core.models import Email, TokenDetails

TTL_SECONDS = 600  # 10 minutes

def create_redis_client() -> redis.Redis:
    try:
        client = redis.Redis(
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", 6379)),
            db=0,
            decode_responses=True
        )
        if not client.ping():  # Server check
            raise redis.ConnectionError("Redis ping failed")
        return client
    except Exception as e:
        raise RuntimeError(f"[Redis] Initialization failed: {e}") from e

# Initialize Redis client
r = create_redis_client()

def is_valid_session(sid: str) -> bool:
    if r.exists(sid) == 1:
        r.expire(sid, TTL_SECONDS, gt=False) # Extend expiry
        return True
    else:
        return False
    
def session_has_user_details(sid: str) -> bool:
    return r.hexists(sid, "user_details")

def session_has_mail_list(sid: str) -> bool:
    return r.hexists(sid, "mail_list")

def same_cached_filters(sid: str, filter: str, count: str) -> bool:
    try:
        view_json = r.hget(sid, "view")
        if view_json:
            view = json.loads(view_json)
            cached_filter = view.get("filter", "")
            cached_count = str(view.get("count", "25"))
            if cached_filter == filter and cached_count == count:
                return True
        return False
    except Exception as e:
        raise RuntimeError(f"[Redis] Check cached filter failed: {e}") from e

def create_session(sid: str, token_details: TokenDetails):
    try:
        r.hset(sid, mapping={
            "provider": token_details["provider"],
            "access_token": token_details["access_token"],
            "refresh_token": token_details["refresh_token"],
            "expiry_time": str(token_details["expiry_time"]),
            "view": json.dumps({"filter": "", "count": 25})
        })
        r.expire(sid, TTL_SECONDS)
        return True
    except Exception as e:
        raise RuntimeError(f"[Redis] Store session failed: {e}") from e

def get_session(sid: str) -> TokenDetails | None:
    try:
        session_data = r.hgetall(sid)
        if not session_data:
            return None
        return TokenDetails(
            provider=session_data["provider"],
            access_token=session_data["access_token"],
            refresh_token=session_data.get("refresh_token"),
            expiry_time=int(session_data["expiry_time"])
        )
    except Exception as e:
        raise RuntimeError(f"[Redis] Get session failed: {e}") from e

def delete_session(sid: str) -> bool:
    try:
        result = r.delete(sid)
        return result == 1
    except Exception as e:
        raise RuntimeError(f"[Redis] Delete session failed: {e}") from e
    
def save_user_details(sid: str, user_details: dict) -> bool:
    try:
        r.hset(sid, mapping={
            "user_details": json.dumps(user_details)
        })
        return True
    except Exception as e:
        raise RuntimeError(f"[Redis] Save user details failed: {e}") from e
    
def get_user_details(sid: str) -> dict | None:
    try:
        user_details_json = r.hget(sid, "user_details")
        if user_details_json:
            return json.loads(user_details_json)
        return None
    except Exception as e:
        raise RuntimeError(f"[Redis] Get user details failed: {e}") from e
    
def save_mail_list(sid: str, mail_list: list[Email]) -> bool:
    try:
        # Check if items are already dicts or Email objects
        if mail_list and isinstance(mail_list[0], dict):
            mail_list_dicts = mail_list
        else:
            mail_list_dicts = [email.dict() for email in mail_list]
        
        r.hset(sid, mapping={
            "mail_list": json.dumps(mail_list_dicts)
        })
        return True
    except Exception as e:
        raise RuntimeError(f"[Redis] Save email list failed: {e}") from e
    
def get_mail_list(sid: str) -> list[Email] | None:
    try:
        mail_list_json = r.hget(sid, "mail_list")
        if mail_list_json:
            email_dicts = json.loads(mail_list_json)
            return [Email(**email_dict) for email_dict in email_dicts]
        return None
    except Exception as e:
        raise RuntimeError(f"[Redis] Get email list failed: {e}") from e
    
def save_current_view(sid: str, filter: str, count: int) -> bool:
    try:
        r.hset(sid, mapping={
            "view": json.dumps({"filter": filter, "count": count})
        })
        return True
    except Exception as e:
        raise RuntimeError(f"[Redis] Save current view failed: {e}") from e
    
def get_current_view(sid: str) -> dict | None:
    try:
        view_json = r.hget(sid, "view")
        if view_json:
            return json.loads(view_json)
        return None
    except Exception as e:
        raise RuntimeError(f"[Redis] Get current view failed: {e}") from e
    
def save_current_thread(sid: str, thread: str) -> bool:
    try:
        r.hset(sid, mapping={
            "current_thread": json.dumps(thread)
        })
        return True
    except Exception as e:
        raise RuntimeError(f"[Redis] Save current thread failed: {e}") from e

def get_current_thread(sid: str) -> str | None:
    try:
        thread = r.hget(sid, "current_thread")
        return json.loads(thread) if thread else None
    except Exception as e:
        raise RuntimeError(f"[Redis] Get current thread failed: {e}") from e