import requests

token = "PASTE_YOUR_ACCESS_TOKEN_HERE"

url = "http://127.0.0.1:8000/predict"
payload = {"values": [0.0]*512}  # Must match feature length

headers = {
    "Authorization": f"Bearer {token}"
}

response = requests.post(url, json=payload, headers=headers)
print(response.status_code)
print(response.json())
