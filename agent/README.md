# AI Customer Operations Agent

## Purpose
Prepare a safe foundation for an Outlook customer-support agent.

## Safety mode
- Read and classify messages only after secure Microsoft authentication is configured.
- Do not send automatic replies in the initial version.
- Do not approve refunds, cancellations, compensation, or account changes.
- Escalate uncertain or sensitive cases for human review.
- Never store passwords, access tokens, or API keys in source files.

## Planned workflow
1. Check unread Outlook messages.
2. Classify each message.
3. Prepare a suggested reply for routine requests.
4. Flag sensitive cases for human review.
5. Record processing results and prevent duplicate replies.

## Current status
Documentation only. The mailbox connection and scheduled execution are not configured yet.
