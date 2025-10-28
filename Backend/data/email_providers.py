from datetime import datetime
from email.utils import parsedate_to_datetime
import json
import os
from typing import Dict
import uuid
import requests
from email import message_from_bytes

from core.models import EmailProviderConfig, TokenRequestPayload

Email_Providers: Dict[str, EmailProviderConfig] = {
    "google": EmailProviderConfig(
        domains=["gmail.com", "googlemail.com"],
        mx_patterns=["google.com", "googlemail.com"],
        sso_url="https://accounts.google.com/o/oauth2/v2/auth",
        token_url="https://oauth2.googleapis.com/token",
        token_request_payload=lambda code: TokenRequestPayload(
            client_id=os.getenv("GOOGLE_CLIENT_ID"),
            client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
            code=code,
            redirect_uri=f"{os.getenv('FRONTEND_URL')}/auth/google/callback",
            grant_type="authorization_code",
            scope="https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
            access_type="offline",
            prompt="consent"
        ).model_dump(),
        get_profile=lambda access_token: get_google_profile(access_token),
        get_mails=lambda access_token, count, filter: get_google_mails(access_token, count, filter)
    ),
    "microsoft": EmailProviderConfig(
        domains=["outlook.com", "hotmail.com", "live.com"],
        mx_patterns=["outlook.com", "protection.outlook.com"],
        sso_url="https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        token_url="https://login.microsoftonline.com/common/oauth2/v2.0/token",
        token_request_payload=lambda code: TokenRequestPayload(
            client_id=os.getenv("MICROSOFT_CLIENT_ID"),
            client_secret=os.getenv("MICROSOFT_CLIENT_SECRET"),
            code=code,
            redirect_uri=f"{os.getenv('FRONTEND_URL')}/auth/microsoft/callback",
            grant_type="authorization_code",
            scope="https://graph.microsoft.com/User.Read Mail.Read offline_access"
        ).model_dump(),
        get_profile=lambda access_token: get_microsoft_profile(access_token),
        get_mails=lambda access_token, count, filter: get_micosoft_mails(access_token, count, filter)
    )
}

def get_google_profile(access_token: str):
    endpoint = "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses"
    headers = {"Authorization": f"Bearer {access_token}"}
    res = requests.get(endpoint, headers=headers)
    data = res.json()

    profile = {
        "name": data.get("names", [{}])[0].get("displayName", "Unknown"),
        "email": data.get("emailAddresses", [{}])[0].get("value", "Unknown")
    }

    return profile

def get_google_mails(access_token: str, count: int = 25, filter: str = ""):
    try:
        get_mail_ids_endpoint = "https://gmail.googleapis.com/gmail/v1/users/me/messages"
        headers = {"Authorization": f"Bearer {access_token}"}
        params = {
            "maxResults": count,
            "q": filter
     }
        # Get message IDs
        res = requests.get(get_mail_ids_endpoint, headers=headers, params=params)
        message_ids = [msg["id"] for msg in res.json().get("messages", [])]
        if not message_ids:
            return []

        google_mail_batch_endpoint = "https://www.googleapis.com/batch/gmail/v1"

        batch_request_boundary = "batch_" + datetime.now().strftime("%Y%m%d%H%M%S") + "_" + uuid.uuid4().hex

        batch_request_headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": f"multipart/mixed; boundary={batch_request_boundary}",
        }

        batch_request_body = ""
        # Build batch request body
        for i, message_id in enumerate(message_ids, start=1):
            request_part = (
            f"--{batch_request_boundary}\r\n"
            "Content-Type: application/http\r\n"
            f"Content-ID: <item{i}>\r\n\r\n"
            f"GET /gmail/v1/users/me/messages/{message_id}"
            f"?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date\r\n"
            )
            batch_request_body += request_part

        batch_request_body += f"--{batch_request_boundary}--\r\n"

        # Send batch request
        res = requests.post(google_mail_batch_endpoint, headers=batch_request_headers, data=batch_request_body)
        res.raise_for_status()

        # Parse multipart batch response
        content_type = res.headers["Content-Type"]
        batch_boundary = content_type.split("boundary=")[1].strip()

        # Create a message from the batch response
        batch_msg = message_from_bytes(
            b"Content-Type: multipart/mixed; boundary=" + batch_boundary.encode() + b"\r\n\r\n" + res.content
        )

        mails = []
        # Extract individual messages from batch response
        for part in batch_msg.get_payload():
            if part.get_content_type() != "application/http":
                print("Unexpected content type in batch part")
                continue

            payload = part.get_payload(decode=True)
            if not payload:
                print("Empty payload in batch part")
                continue

            http_response = payload.decode("utf-8", errors="ignore")
            if "\r\n\r\n" not in http_response:
                print("Malformed HTTP response in batch part")
                continue

            # known issue: sometimes google returns 429 for some mails in batch
            status_line = http_response.split("\r\n")[0]
            if "200" not in status_line:
                print(f"Batch part failed with status: {status_line}")
                continue

            json_part = http_response.split("\r\n\r\n", 1)[1]

            msg_data = json.loads(json_part)



            headers = {h['name']: h['value'] for h in msg_data.get('payload', {}).get('headers', [])}

            # Extract sender details
            from_val = headers.get("From", "")
            if "<" in from_val:
                sender_name = from_val.split("<")[0].strip().strip('"')
                sender_email = from_val.split("<")[1].strip(">")
            else:
                sender_name = ""
                sender_email = from_val.strip()

            mails.append({
                "id": msg_data.get("id"),
                "sender": {
                    "name": sender_name,
                    "email": sender_email
                },
                "subject": headers.get("Subject", ""),
                "bodyPreview": msg_data.get("snippet", ""),
                "date": parsedate_to_datetime(headers.get("Date", "")).strftime("%d-%m-%Y") if headers.get("Date") else ""
            })
    except Exception as e:
        print(f"Error processing email part: {e}")
        raise e

    return mails

def get_microsoft_profile(access_token: str):
    endpoint = "https://graph.microsoft.com/v1.0/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    res = requests.get(endpoint, headers=headers)
    data = res.json()

    print(data)

    profile = {
        "name": data.get("displayName", "Unknown"),
        "email": data.get("mail") or data.get("userPrincipalName", "Unknown")
    }

    return profile

def get_micosoft_mails(access_token: str, count: int = 25, filter: str = ""):
    endpoint = "https://graph.microsoft.com/v1.0/me/messages"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {
        "$top": count,
        "$filter": filter,
        "$select": "id,subject,bodyPreview,sender,receivedDateTime,hasAttachments"
    }

    res = requests.get(endpoint, headers=headers, params=params)
    res.raise_for_status()
    data = res.json().get("value", [])

    mails = []
    for msg in data:
        received = datetime.strptime(msg["receivedDateTime"], "%Y-%m-%dT%H:%M:%SZ")
        mails.append({
            "id": msg["id"],
            "sender": {
                "name": msg.get("sender", {}).get("emailAddress", {}).get("name", ""),
                "email": msg.get("sender", {}).get("emailAddress", {}).get("address", ""),
            },
            "subject": msg.get("subject", ""),
            "snippet": msg.get("bodyPreview", ""),
            "date": received.strftime("%d-%m-%Y")
        })

    return mails