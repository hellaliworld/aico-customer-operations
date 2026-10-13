import os
import json
import urllib.request
import urllib.parse


def get_access_token():
    client_id = os.environ["MS_CLIENT_ID"]
    refresh_token = os.environ["MS_REFRESH_TOKEN"]
    data = urllib.parse.urlencode({
        "client_id": client_id,
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "scope": "offline_access https://graph.microsoft.com/Mail.Read"
    }).encode()
    req = urllib.request.Request(
        "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.loads(response.read())["access_token"]


def main():
    token = get_access_token()
    url = ("https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages"
           "?$top=10&$filter=isRead%20eq%20false"
           "&$select=subject,from,receivedDateTime,bodyPreview,isRead")
    req = urllib.request.Request(url, headers={
        "Authorization": "Bearer " + token,
        "Accept": "application/json"
    })
    with urllib.request.urlopen(req, timeout=30) as response:
        messages = json.loads(response.read()).get("value", [])

    print("Unread messages found:", len(messages))
    sensitive = ["refund", "cancel", "damaged", "broken", "complaint", "chargeback"]
    for message in messages:
        subject = message.get("subject") or "(no subject)"
        preview = message.get("bodyPreview") or ""
        text = (subject + " " + preview).lower()
        category = "HUMAN_REVIEW" if any(word in text for word in sensitive) else "REVIEW_BEFORE_REPLY"
        print(json.dumps({
            "received": message.get("receivedDateTime"),
            "subject": subject,
            "category": category
        }, ensure_ascii=False))

    print("SAFE MODE: no email was sent or modified.")


if __name__ == "__main__":
    main()
