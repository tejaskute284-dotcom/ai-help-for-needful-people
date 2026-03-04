import requests
import time

BASE_URL = "http://localhost:5000"
API_KEY_NAME = "Antigravity"
API_KEY_VALUE = "sbp_4ec20156f8a932a6f8d0647d2e6b0d93a4c0251f"
HEADERS = {API_KEY_NAME: API_KEY_VALUE}
TIMEOUT = 30

def test_sign_language_gesture_recognition_api():
    # Endpoint aliases to check
    endpoints = [
        "/gesture/recognize",
        "/v1/gesture/recognize",
        "/signlanguage/gesture/recognize"
    ]

    # Sample valid gesture payload for ASL recognition (mock example)
    payload = {
        "gesture_data": {
            "landmarks": [
                {"x":0.1,"y":0.2,"z":0.0},
                {"x":0.15,"y":0.25,"z":0.05},
                {"x":0.2,"y":0.3,"z":0.1}
            ],
            "hand": "right"
        }
    }

    # Function to do a single recognition request and validate response
    def do_request(url):
        resp = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Unexpected status code {resp.status_code}"
        data = resp.json()
        assert "translation" in data, "Response missing 'translation'"
        assert isinstance(data["translation"], str), "'translation' is not string"
        assert len(data["translation"]) > 0, "Translation is empty"
        return data

    # Test each route alias
    for ep in endpoints:
        url = BASE_URL + ep
        result = do_request(url)
        # Basic content check for translation string
        assert all(c.isalpha() or c.isspace() for c in result["translation"]), "Translation contains invalid characters"

    # Test rate limit by making 1000 requests and expect no 429 errors
    for i in range(1000):
        url = BASE_URL + endpoints[0]
        resp = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Rate limit test failed at request {i+1} with status {resp.status_code}"

    # Simulate backend restart by waiting and re-testing
    time.sleep(3)

    # Post-restart check same as initial check
    url = BASE_URL + endpoints[0]
    post_restart_resp = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
    assert post_restart_resp.status_code == 200, "Post-restart gesture recognition failed"
    post_data = post_restart_resp.json()
    assert "translation" in post_data and isinstance(post_data["translation"], str) and len(post_data["translation"]) > 0, "Invalid post-restart translation"

test_sign_language_gesture_recognition_api()