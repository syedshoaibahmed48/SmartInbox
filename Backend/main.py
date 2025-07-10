import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.auth import router as auth_router

from core.errors import http_exception_handler, validation_exception_handler

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

    # API key check
    if request.headers.get("Authorization") != f"Bearer {API_KEY}":
        return JSONResponse(status_code=401, content={"error": "Unauthorized: Invalid or missing API key."})

    response = await call_next(request)
    return response

# Register routes
app.include_router(auth_router, prefix="/auth", tags=["auth"])



# Register error handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)

@app.get("/")
def root():
    return {"status": "ok"}

