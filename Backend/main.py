import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import PROTECTED_PATHS
from core.errors import http_exception_handler, validation_exception_handler
from services.sid_utils import is_valid_encrypted_sid
from api.auth import router as auth_router
from api.mails import router as mails_router
from api.chat import router as chat_router



load_dotenv()

app = FastAPI()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Allow requests from frontend 
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],  # Next.js app URL from .env
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

API_KEY = os.getenv("API_KEY")

# Middleware to check API key
@app.middleware("http")
async def api_key_middleware(request, call_next):
    # API key and session ID checks
    if request.headers.get("Authorization") != f"Bearer {API_KEY}":
        print("Unauthorized: Invalid or missing API key.")
        return JSONResponse(status_code=401, content={"error": "Unauthorized: Invalid or missing API key."})
    elif any(path in request.url.path for path in PROTECTED_PATHS) and not is_valid_encrypted_sid(request.headers.get("X-Session-ID", "")):
        return JSONResponse(status_code=440, content={"error": "Session over due to inactivity, please login again"})
    
    response = await call_next(request)
    return response

# Register routes
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(mails_router, prefix="/mails", tags=["mails"])
app.include_router(chat_router, prefix="/chat", tags=["chat"])

# Register error handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)

@app.get("/")
def root():
    return {"status": "ok"}

