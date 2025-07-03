from Pydantic import BaseModel, EmailStr, Field

class Email(BaseModel):
    email: EmailStr = Field(..., description="The email address of the user")