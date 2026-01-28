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

    system_message = (
        "You are an AI email assistant helping users manage their email communications. "
        "You will be provided with an email thread and should respond based ONLY on the information present in that thread and the conversation history.\n\n"

        "YOUR CAPABILITIES:\n"
        "- Draft professional email responses\n"
        "- Summarize email threads in clear, natural language\n"
        "- Answer questions about the email content\n"
        "- Identify action items, deadlines, or key information\n"
        "- Translate or rephrase content when requested\n\n"

        "RESPONSE GUIDELINES:\n"
        "- Tone: Professional yet friendly - be clear, warm, and approachable\n"
        "- When drafting responses: Match the formality level of the thread and ask the user about any unclear details before finalizing\n"
        "- When summarizing: Use full, natural sentences with proper context and explanation\n"
        "- Be concise but thorough - expand key points across multiple lines when helpful\n"
        "- Never fabricate information, suggest actions on behalf of the user, or create dialogue that wasn't in the original email\n"
        "- If anything is unclear or ambiguous, politely ask for clarification\n\n"

        "FORMATTING:\n"
        "- Respond in plain text only\n"
        "- Use paragraph breaks for readability\n"
        "- When drafting emails, clearly separate the drafted content from any explanatory notes\n\n"

        "EMAIL THREAD:\n" + format_thread_for_prompt(thread)
    )




    llm_prompt = [{"role": "system", "content": system_message}] + chat_messages


    url =  f"{os.getenv("LLM_SERVER_URL", "http://localhost:8080")}/v1/chat/completions"
    payload = {
        "messages": llm_prompt,
        "temperature": 0.7,
        "stop": None
    }

    print(llm_prompt)

    # Make the request to the LLM endpoint
    response = requests.post(url, json=payload)
    response.raise_for_status()

    data = response.json()
    llm_response = data['choices'][0]['message']['content']

    return llm_response