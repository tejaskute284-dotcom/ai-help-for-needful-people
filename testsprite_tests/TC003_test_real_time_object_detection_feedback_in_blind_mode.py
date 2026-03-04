import requests
import time

BASE_URL = "http://localhost:5000"
API_KEY = "sbp_4ec20156f8a932a6f8d0647d2e6b0d93a4c0251f"
HEADERS = {"Authorization": f"ApiKey {API_KEY}", "Content-Type": "application/json"}
TIMEOUT = 30

def test_real_time_object_detection_feedback_in_blind_mode():
    # Endpoint aliases for blind mode object detection feedback (example aliases)
    aliases = [
        "/blindmode/object-detection",
        "/blindmode/detect",
        "/blindmode/feedback"
    ]

    # Sample payload simulating a simple object detection input (e.g. image data placeholder or sensor data)
    detection_payload = {
        "image_data": "base64EncodedImageString==",
        "timestamp": int(time.time() * 1000)
    }

    # Verify rate limiting: max 1000 requests allowed, we'll do a safe subset (e.g. 5 quick requests)
    # and confirm no 429 status
    for i in range(5):
        for alias in aliases:
            try:
                start = time.time()
                response = requests.post(
                    BASE_URL + alias,
                    headers=HEADERS,
                    json=detection_payload,
                    timeout=TIMEOUT
                )
                latency = time.time() - start

                # Verify status code success
                assert response.status_code == 200, f"Failed at alias {alias} with status {response.status_code}"

                # Validate minimal latency (< 1 second)
                assert latency < 1, f"High latency {latency:.3f}s at alias {alias}"

                # Validate response content structure
                data = response.json()
                assert "detected_objects" in data, "Missing 'detected_objects' in response"
                assert isinstance(data["detected_objects"], list), "'detected_objects' should be a list"

                # Validate text-to-speech feedback field presence
                assert "tts_feedback" in data, "Missing 'tts_feedback' in response"
                assert isinstance(data["tts_feedback"], str) and data["tts_feedback"], "'tts_feedback' should be a non-empty string"

            except requests.exceptions.RequestException as e:
                assert False, f"RequestException at alias {alias}: {e}"

    # Simulate backend restart by calling a restart endpoint if available, else re-test after wait
    # Assume a POST /admin/restart exists for simulation (if not, fallback to wait)
    try:
        restart_resp = requests.post(BASE_URL + "/admin/restart", headers=HEADERS, timeout=TIMEOUT)
        assert restart_resp.status_code == 200, "Backend restart failed"
        time.sleep(5)  # wait for restart
    except requests.exceptions.RequestException:
        time.sleep(10)  # fallback wait

    # After restart, verify persistence: send detection request and expect success
    for alias in aliases:
        try:
            start = time.time()
            response = requests.post(
                BASE_URL + alias,
                headers=HEADERS,
                json=detection_payload,
                timeout=TIMEOUT
            )
            latency = time.time() - start

            assert response.status_code == 200, f"Post-restart failed at alias {alias} with status {response.status_code}"
            assert latency < 1, f"High latency {latency:.3f}s post-restart at alias {alias}"

            data = response.json()
            assert "detected_objects" in data, "Missing 'detected_objects' post-restart"
            assert "tts_feedback" in data and data["tts_feedback"], "Missing or empty 'tts_feedback' post-restart"

        except requests.exceptions.RequestException as e:
            assert False, f"RequestException post-restart at alias {alias}: {e}"

test_real_time_object_detection_feedback_in_blind_mode()