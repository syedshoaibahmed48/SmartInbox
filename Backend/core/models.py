
from pydantic import BaseModel, Field
from typing import Callable, List, Optional


class Email(BaseModel):
    id: int = Field(..., description="Unique identifier for the email")
    sender: dict = Field(..., description="Sender information")
    to: str = Field(..., description="Recipient email address")
    date: str = Field(..., description="Date of the email")
    time: str = Field(..., description="Time of the email")
    body: str = Field(..., description="Body content of the email")
    hasAttachment: bool = Field(..., description="Whether the email has an attachment")

class TokenRequestPayload(BaseModel):
    client_id: str = Field(..., description="OAuth client ID")
    client_secret: Optional[str] = Field(None, description="OAuth client secret")
    code: Optional[str] = Field(None, description="Authorization code")
    redirect_uri: str = Field(..., description="Redirect URI")
    grant_type: str = Field(..., description="Grant type")
    scope: str = Field(..., description="OAuth scopes")
    access_type: Optional[str] = Field(None, description="Access type (if applicable)")
    prompt: Optional[str] = Field(None, description="Prompt (if applicable)")

class EmailProviderConfig(BaseModel):
    domains: List[str] = Field(..., description="Supported email domains")
    mx_patterns: List[str] = Field(..., description="MX patterns for provider detection")
    sso_url: str = Field(..., description="SSO URL for OAuth flow")
    token_url: str = Field(..., description="Token endpoint URL")
    token_request_payload: Callable[[Optional[str]], dict] = Field(..., description="Function to build token request payload (returns TokenRequestPayload)")
    get_profile: Callable[[str], dict] = Field(..., description="Function to get user profile data")
    get_mails: Callable[[str, int, str], dict] = Field(..., description="Function to get user mails")
    get_thread: Callable[[str, str], dict] = Field(..., description="Function to get a mail thread")

class TokenDetails(BaseModel):
    provider: str = Field(..., description="OAuth provider name")
    access_token: str = Field(..., description="Access token")
    refresh_token: str = Field(None, description="Refresh token")
    expiry_time: int = Field(..., description="Token expiry time as a UNIX timestamp")