import os
from dns import resolver
from dotenv import load_dotenv
from fastapi import HTTPException
from data.email_providers import Email_Providers

load_dotenv()

def is_valid_email(email: str) -> bool:
    import re
    email_regex = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(email_regex, email) is not None

def create_sso_url(email: str, provider: str) -> str:
    base_url = Email_Providers[provider]["sso_url"]
    
    if provider == "google":
        base_url += f"?client_id={os.getenv('GOOGLE_CLIENT_ID')}&redirect_uri={os.getenv('POST_SSO_REDIRECT_URL')}&response_type=code&scope=https://www.googleapis.com/auth/gmail.readonly&login_hint={email}"
    elif provider == "microsoft":
        base_url += f"?client_id={os.getenv('MICROSOFT_CLIENT_ID')}&redirect_uri={os.getenv('POST_SSO_REDIRECT_URL')}&response_type=code&scope=https://graph.microsoft.com/Mail.Read&login_hint={email}"

    return base_url

def get_sso_url(email: str) -> str:

    domain = email.split('@')[1]

    # Check direct domain match
    for provider, info in Email_Providers.items():
        if domain in info["domains"]:
            return create_sso_url(email, provider)

    # if no direct match, check MX hosts
    try:
        mx_records = resolver.resolve(domain, 'MX')
        mx_hosts = [str(record.exchange) for record in mx_records]
    except resolver.NXDOMAIN:
        raise HTTPException(status_code=400, detail=f"Domain does not exist")
    except resolver.NoAnswer:
         raise HTTPException(status_code=400, detail="Domain has no MX records (can't receive email)")
    except Exception as e:
        mx_hosts = []

    # Check if any MX host matches known patterns
    for host in mx_hosts:
        host = host.lower()
        for provider, info in Email_Providers.items():
            if any(pattern in host for pattern in info["mx_patterns"]):
                return create_sso_url(email, provider)

    return "unknown"
