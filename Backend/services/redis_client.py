import redis
import os

from core.models import TokenDetails

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
        r.expire(sid, 1, gt=False) # Extend expiry
        return True
    else:
        return False

def store_session(sid: str, token_details: TokenDetails):
    try:
        r.hset(sid, mapping={
            "provider": token_details["provider"],
            "access_token": token_details["access_token"],
            "refresh_token": token_details["refresh_token"],
            "expiry_time": str(token_details["expiry_time"])
        })
        r.expire(sid, 600)  # 10 minutes
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