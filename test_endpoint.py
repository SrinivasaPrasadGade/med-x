import requests
import os

# Create a dummy image file
with open("test.jpg", "wb") as f:
    f.write(os.urandom(1024))

url = "http://127.0.0.1:8000/api/scan-prescription"
files = {'file': ('test.jpg', open('test.jpg', 'rb'), 'image/jpeg')}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
