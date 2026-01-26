import os
from typing import List

import requests
from core.models import Email

def format_thread_for_prompt(thread: List[Email]) -> str:
    formatted_emails = []
    for email in thread:
        sender_name = email.get('sender', {}).get('name', 'Unknown')
        sender_email = email.get('sender', {}).get('email', 'Unknown')
        to_email = email.get('to', 'Unknown')
        date = email.get('date', 'Unknown')
        time = email.get('time', 'Unknown')
        body = email.get('body', '')
        formatted_email = f"From: {sender_name} <{sender_email}> To: {to_email}\nDate: {date} at {time}\nSubject: {email.get('subject', 'No Subject')}\nBody: {body}"
        formatted_emails.append(formatted_email)

    return "\n---\n".join(formatted_emails)


def get_llm_response(thread: List[Email], chat_messages: List[dict]) -> str:

    llm_prompt = [
        {"role": "system", "content": "You are an intelligent email assistant; Your job is to help the user understand, summarize, translate, or respond to emails using ONLY the information provided in the email thread and the chat history. respond to the latest user message in plain text only, reply in a professional, concise, friendly toney, do not make assumptions or add external details, keep the response relevant and actionable, and politely ask for clarification if the user input is unclear."},
        {"role": "user", "content": f"Here is the email thread:\n{format_thread_for_prompt(thread)}"}
    ] + chat_messages

    url =  f"{os.getenv("LLM_SERVER_URL", "http://localhost:8080")}/v1/chat/completions"
    payload = {
        "messages": llm_prompt,
        "temperature": 0.7,
        "stop": None
    }

    # Make the request to the LLM endpoint
    response = requests.post(url, json=payload)
    response.raise_for_status()

    data = response.json()
    llm_response = data['choices'][0]['message']['content']

    return llm_response