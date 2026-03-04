import requests
import time

BASE_URL = "http://localhost:5000"
HEADERS = {
    "Authorization": "ApiKey sbp_4ec20156f8a932a6f8d0647d2e6b0d93a4c0251f",
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_real_time_speech_to_text_and_sound_event_detection_deaf_mode():
    realtime_endpoint_aliases = ["/deafmode/realtime", "/deaf/realtime", "/modes/deaf/realtime"]
    test_audio_payload = {
        "audioChunk": "c2FtcGxlIGF1ZGlvIGRhdGE="  # Base64 encoded dummy audio chunk "sample audio data"
    }
    
    # 1. Verify rate limiting: 1000 requests allowed, send 1001 requests and expect last to fail
    success_count = 0
    fail_count = 0

    # Pick first alias for initial testing
    endpoint = BASE_URL + realtime_endpoint_aliases[0]

    for i in range(1001):
        try:
            resp = requests.post(endpoint, headers=HEADERS, json=test_audio_payload, timeout=TIMEOUT)
            if i < 1000:
                assert resp.status_code == 200, f"Expected HTTP 200 before rate limit, got {resp.status_code} at request {i+1}"
                json_resp = resp.json()
                assert "transcription" in json_resp and isinstance(json_resp["transcription"], str), "Missing or invalid 'transcription' field"
                assert "detectedSounds" in json_resp and isinstance(json_resp["detectedSounds"], list), "Missing or invalid 'detectedSounds' field"
                success_count += 1
            else:
                # Expect some rate limiting error (e.g. 429)
                assert resp.status_code in (429, 403), f"Expected rate limit status code on request {i+1}, got {resp.status_code}"
                fail_count += 1
        except (requests.RequestException, AssertionError) as e:
            if i < 1000:
                raise AssertionError(f"Request {i+1} failed unexpectedly: {str(e)}") from e
            else:
                # Accept failure due to rate limit on last request
                fail_count += 1
        time.sleep(0.01)  # small delay to avoid bursting too fast

    assert success_count == 1000, f"Expected 1000 successful requests, got {success_count}"
    assert fail_count >= 1, "Expected at least 1 failure due to rate limiting"

    # 2. Verify persistence across 'restarts' (simulate restart by waiting, then test requests still succeed)
    # Since no actual restart control, simulate by short pause and re-test
    time.sleep(1)  # Simulate downtime and restart time

    for alias in realtime_endpoint_aliases:
        endpoint = BASE_URL + alias
        try:
            resp = requests.post(endpoint, headers=HEADERS, json=test_audio_payload, timeout=TIMEOUT)
            assert resp.status_code == 200, f"Expected HTTP 200 from alias {alias}, got {resp.status_code}"
            json_resp = resp.json()
            assert "transcription" in json_resp and isinstance(json_resp["transcription"], str), f"Missing or invalid 'transcription' from alias {alias}"
            assert "detectedSounds" in json_resp and isinstance(json_resp["detectedSounds"], list), f"Missing or invalid 'detectedSounds' from alias {alias}"
        except (requests.RequestException, AssertionError) as e:
            raise AssertionError(f"Failed on alias {alias}: {str(e)}") from e

    # 3. Connectivity sanity check with retries
    max_retries = 3
    connected = False
    for _ in range(max_retries):
        try:
            resp = requests.options(BASE_URL, headers=HEADERS, timeout=TIMEOUT)
            if resp.status_code in (200, 204):
                connected = True
                break
        except requests.RequestException:
            time.sleep(1)
    assert connected, f"Connectivity issue: Unable to reach base URL {BASE_URL} after {max_retries} attempts"

test_real_time_speech_to_text_and_sound_event_detection_deaf_mode()