from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import HTTPException, Request
from typing import Callable

# Handles Pydantic validation errors (like invalid EmailStr)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    for error in exc.errors():
        loc = error.get("loc", [])
        field = loc[-1] if loc else "unknown"
        if field == "email":
            return JSONResponse(
                status_code=400,
                content={"message": "Invalid email address"},
            )

    # Generic fallback if not email-related
    return JSONResponse(
        status_code=422,
        content={"message": "Validation failed", "details": exc.errors()},
    )

#Handles FastAPI-raised HTTPExceptions and formats with "message" key
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )