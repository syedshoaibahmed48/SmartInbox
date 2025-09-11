import os
from typing import Dict

Email_Providers: Dict[str, Dict[str, str]] = {
    "google": {
        "domains": ["gmail.com", "googlemail.com"],
        "mx_patterns": ["google.com", "googlemail.com"],
        "sso_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "scope": "https://www.googleapis.com/auth/gmail.readonly",
        "token_url": "https://oauth2.googleapis.com/token",
        "token_params": lambda code: {
            "client_id": os.getenv("GOOGLE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
            "code": code,
            "redirect_uri": f"{os.getenv('FRONTEND_URL')}/auth/google/callback",
            "grant_type": "authorization_code"
        }
    },
    "microsoft": {
        "domains": ["outlook.com", "hotmail.com", "live.com"],
        "mx_patterns": ["outlook.com", "protection.outlook.com"],
        "sso_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        "scope": "https://graph.microsoft.com/Mail.Read",
        "token_url": "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        "token_params": lambda code: {
            "client_id": os.getenv("MS_CLIENT_ID"),
            "client_secret": os.getenv("MS_CLIENT_SECRET"),
            "code": code,
            "redirect_uri": f"{os.getenv('FRONTEND_URL')}/auth/microsoft/callback",
            "grant_type": "authorization_code",
            "scope": "openid profile email offline_access User.Read"
        }
    }
}