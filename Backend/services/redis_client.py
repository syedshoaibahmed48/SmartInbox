import redis
import os

from models.auth_models import TokenDetails

# Initialize Redis client
try:
    r = redis.Redis(
        host=os.getenv("REDIS_HOST", "localhost"),
        port=int(os.getenv("REDIS_PORT", 6379)),
        db=0,
        decode_responses=True
    )
    r.ping()  # Test connection
except redis.ConnectionError as e:
    print(f"Error connecting to Redis: {e}")
    r = None
    raise e

def store_session(sid: str, token_details: TokenDetails):
    if r is None:
        print("Redis client is not initialized.")
        return None
    try:
        r.hmset(sid, {
            "provider": token_details["provider"],
            "access_token": token_details["access_token"],
            "refresh_token": token_details["refresh_token"],
            "expiry_time": str(token_details["expiry_time"])
        })
        r.expire(sid, 600)  # Set expiry to 10 mins
        return True
    except Exception as e:
        print(f"Error storing session in Redis: {e}")
        return None