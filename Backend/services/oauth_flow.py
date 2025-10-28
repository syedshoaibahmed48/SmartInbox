import os
import time
from dns import resolver
from dotenv import load_dotenv
from fastapi import HTTPException
from data.email_providers import Email_Providers
from urllib.parse import urlencode
import requests

load_dotenv()

def is_valid_email(email: str) -> bool:
    import re
    email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(email_regex, email) is not None

def create_sso_url(email: str, provider: str) -> str:
    if provider not in Email_Providers:
        raise ValueError(f"Unsupported provider: {provider}")

    config = Email_Providers[provider]
    if not config:
        raise ValueError(f"Unsupported provider: {provider}")

    # Base parameters
    params = {
        "client_id": os.getenv(f"{provider.upper()}_CLIENT_ID"),
        "redirect_uri": f"{os.getenv('FRONTEND_URL')}/auth/{provider}/callback",
        "response_type": "code",
        "scope": config.token_request_payload(None)["scope"],
        "login_hint": email
    }



    # Additional parameters
    if config.token_request_payload(None)["access_type"] is not None:
        params["access_type"] = config.token_request_payload(None)["access_type"]

    if config.token_request_payload(None)["prompt"] is not None:
        params["prompt"] = config.token_request_payload(None)["prompt"]

    return f"{config.sso_url}?{urlencode(params)}"


def get_sso_url(email: str) -> str:

    domain = email.split('@')[1]

    # Check direct domain match
    for provider, info in Email_Providers.items():
        if domain in info.domains:
            return create_sso_url(email, provider)

    # if no direct match, check MX hosts
    try:
        mx_records = resolver.resolve(domain, 'MX')
        mx_hosts = [str(record.exchange) for record in mx_records]
    except resolver.NXDOMAIN:
        raise HTTPException(status_code=400, detail=f"The email address you entered doesn’t appear to exist. Please check for typos.")
    except resolver.NoAnswer:
         raise HTTPException(status_code=400, detail="The email domain you entered cannot receive emails. Please use a valid email address.")
    except Exception as e:
        raise HTTPException(status_code=400, detail="We couldn’t verify this email address at the moment. Please try again later.")

    # Check if any MX host matches known patterns
    for host in mx_hosts:
        host = host.lower()
        for provider, info in Email_Providers.items():
            if any(pattern in host for pattern in info["mx_patterns"]):
                return create_sso_url(email, provider)

    return "unknown"


def get_access_refresh_tokens(provider: str, code: str):

    if provider not in Email_Providers:
        raise ValueError(f"Unsupported provider: {provider}")

    token_url = Email_Providers[provider].token_url
    if not token_url:
        raise ValueError(f"Token URL not configured for provider: {provider}")

    data = Email_Providers[provider].token_request_payload(code)

    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    try:
        response = requests.post(token_url, data=data, headers=headers)
        token_details = response.json()  

        if response.status_code != 200 or "access_token" not in token_details:
            return None
        return {
            "provider": provider,
            "access_token": token_details.get("access_token"),
            "refresh_token": token_details.get("refresh_token"),
            "expiry_time": int(time.time()) + token_details.get("expires_in")
        }
    except requests.RequestException as e:
        return None