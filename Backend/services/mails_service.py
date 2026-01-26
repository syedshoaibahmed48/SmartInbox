import requests
from data.email_providers import Email_Providers

def get_user_details(provider: str, access_token: str):
    config = Email_Providers[provider]
    try:
        return config.get_profile(access_token)
    except requests.RequestException as e:
        return None
    
def get_user_mails(provider: str, access_token: str, count: int = 25, filter: str = ""):
    config = Email_Providers[provider]
    try:
        return config.get_mails(access_token, count, filter)
    except requests.RequestException as e:
        return None
    
def get_mail_thread(provider: str, access_token: str, thread_id: str):

    config = Email_Providers[provider]
    try:
        mail_thread = config.get_thread(access_token, thread_id)
        return mail_thread
    except requests.RequestException as e:
        return None