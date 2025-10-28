### 🐞 **KNOWN_ISSUES.md**
```markdown
# Known Issues

## 1. Gmail API Rate Limiting
- **Description:** The Gmail API occasionally returns HTTP 429 (Too Many Requests) during `GET /mails` calls.  
- **Impact:** Some mails cant be fetched.
- **Workaround:** Skip problematic mails for now. 
- **Status:** Being monitored and optimized.
