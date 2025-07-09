Email_Providers = {
    "google": {
        "domains": ["gmail.com", "googlemail.com"],
        "mx_patterns": ["google.com", "googlemail.com"],
        "sso_url": "https://accounts.google.com/o/oauth2/v2/auth",
    },
    "microsoft": {
        "domains": ["outlook.com", "hotmail.com", "live.com"],
        "mx_patterns": ["outlook.com", "protection.outlook.com"],
        "sso_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    }
}