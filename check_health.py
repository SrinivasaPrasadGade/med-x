import requests
try:
    response = requests.get("http://127.0.0.1:8000/api/health")
    if response.status_code == 200:
        print("✅ Backend is responding and healthy.")
    else:
        print(f"❌ Backend returned status {response.status_code}")
except Exception as e:
    print(f"❌ Could not connect to backend: {e}")
