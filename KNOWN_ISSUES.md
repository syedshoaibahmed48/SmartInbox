###  KNOWN_ISSUES.md
# Known Issues

## 1. Gmail API Rate Limiting
- Description: The Gmail API occasionally returns HTTP 429 (Too Many Requests) during `GET /mails` calls.  
- Impact: Some mails cant be fetched.
- Workaround: Skip problematic mails for now. 
- Status: Being monitored and optimized.

## 2. Microsoft Graph `$search` limitations
- Description: The Microsoft Graph `/v1.0/me/messages?$search=...` API fails when the search text contains special characters such as `@` or `.` (e.g. email addresses).
- Impact: Search requests may return errors or no results for email-like inputs.
- Workaround: Skip `$search` for inputs containing special characters and allow only normal free-text search.
- Status: Accepted limitation; may be handled in a future iteration.

