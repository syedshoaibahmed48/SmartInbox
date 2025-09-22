
from pydantic import BaseModel, EmailStr, Field
from typing import Callable, List, Optional


class Email(BaseModel):
    email: EmailStr = Field(..., description="The email address of the user")


class TokenRequestPayload(BaseModel):
    client_id: str = Field(..., description="OAuth client ID")
    client_secret: Optional[str] = Field(None, description="OAuth client secret")
    code: Optional[str] = Field(None, description="Authorization code")
    redirect_uri: str = Field(..., description="Redirect URI")
    grant_type: str = Field(..., description="Grant type")
    scope: str = Field(..., description="OAuth scopes")
    access_type: Optional[str] = Field(None, description="Access type (if applicable)")

class EmailProviderConfig(BaseModel):
    domains: List[str] = Field(..., description="Supported email domains")
    mx_patterns: List[str] = Field(..., description="MX patterns for provider detection")
    sso_url: str = Field(..., description="SSO URL for OAuth flow")
    token_url: str = Field(..., description="Token endpoint URL")
    token_request_payload: Callable[[Optional[str]], dict] = Field(..., description="Function to build token request payload (returns TokenRequestPayload)")

class TokenDetails(BaseModel):
    provider: str = Field(..., description="OAuth provider name")
    access_token: str = Field(..., description="Access token")
    refresh_token: str = Field(None, description="Refresh token")
    expiry_time: int = Field(..., description="Token expiry time as a UNIX timestamp")