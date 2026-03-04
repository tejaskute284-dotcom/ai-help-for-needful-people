import requests
import time

BASE_URL = "http://localhost:5000"
API_KEY = "sbp_4ec20156f8a932a6f8d0647d2e6b0d93a4c0251f"
HEADERS = {
    "Authorization": f"ApiKey {API_KEY}",
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_user_profile_and_accessibility_preferences_update():
    # Step 1: Create a new user profile (simulate user creation)
    create_payload = {
        "username": "testuser_tc007",
        "email": "testuser_tc007@example.com",
        "password": "SecureP@ssw0rd123!"
    }
    user_id = None
    try:
        # Create user
        create_resp = requests.post(
            f"{BASE_URL}/api/users/register",
            json=create_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 201, f"User creation failed: {create_resp.text}"
        user_data = create_resp.json()
        user_id = user_data.get("id")
        assert user_id is not None, "User ID not returned on creation"

        # Authenticate user to obtain JWT for update permissions
        login_payload = {
            "username": create_payload["username"],
            "password": create_payload["password"]
        }
        login_resp = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=login_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        token = login_resp.json().get("token")
        assert token, "JWT token not provided on login"

        auth_headers = {
            **HEADERS,
            "Authorization": f"Bearer {token}"
        }

        # Step 2: Update user profile and accessibility preferences
        update_payload = {
            "profile": {
                "firstName": "Test",
                "lastName": "User",
                "email": "testuser_updated_tc007@example.com",
                "phone": "+1234567890",
                "address": "123 Accessibility St, AI City"
            },
            "accessibilityPreferences": {
                "blindMode": True,
                "deafMode": False,
                "signLanguageMode": True,
                "voiceNavigationSpeed": 1.5,
                "screenReaderVolume": 75,
                "captioningEnabled": True,
                "preferredSignLanguage": "ASL"
            }
        }
        update_resp = requests.put(
            f"{BASE_URL}/api/users/{user_id}/profile",
            json=update_payload,
            headers=auth_headers,
            timeout=TIMEOUT
        )
        assert update_resp.status_code == 200, f"Profile update failed: {update_resp.text}"
        updated_data = update_resp.json()

        # Validate updated profile fields
        profile = updated_data.get("profile")
        prefs = updated_data.get("accessibilityPreferences")
        assert profile is not None and prefs is not None, "Updated data structure missing fields"
        assert profile.get("firstName") == update_payload["profile"]["firstName"]
        assert profile.get("lastName") == update_payload["profile"]["lastName"]
        assert profile.get("email") == update_payload["profile"]["email"]
        assert prefs.get("blindMode") == update_payload["accessibilityPreferences"]["blindMode"]
        assert prefs.get("signLanguageMode") == update_payload["accessibilityPreferences"]["signLanguageMode"]
        assert prefs.get("voiceNavigationSpeed") == update_payload["accessibilityPreferences"]["voiceNavigationSpeed"]

        # Step 3: Input Sanitization check - try to inject script tags and confirm they are sanitized or rejected
        malicious_payload = {
            "profile": {
                "firstName": "<script>alert(1)</script>",
                "lastName": "User<script>",
                "email": "testuser<script>@example.com",
                "phone": "+1234567890",
                "address": "<img src=x onerror=alert(1)>"
            },
            "accessibilityPreferences": {
                "blindMode": True,
                "deafMode": False
            }
        }
        sanitize_resp = requests.put(
            f"{BASE_URL}/api/users/{user_id}/profile",
            json=malicious_payload,
            headers=auth_headers,
            timeout=TIMEOUT
        )
        # Expect 400 Bad Request or 200 with sanitized content
        assert sanitize_resp.status_code in (200,400), f"Sanitize check returned unexpected status: {sanitize_resp.status_code}"
        if sanitize_resp.status_code == 200:
            sanitized_data = sanitize_resp.json()
            sanitized_profile = sanitized_data.get("profile", {})
            for key, val in malicious_payload["profile"].items():
                if isinstance(val, str) and ("<script>" in val or "alert" in val or "onerror" in val):
                    # Check that these strings are not present verbatim in the saved data
                    assert sanitized_profile.get(key) != val, f"Input not sanitized for field {key}"
        else:
            # 400 Bad Request indicates rejection of malicious input - acceptable
            pass

        # Step 4: Verify persistence simulation (simulate backend restart by waiting)
        # In real tests, would restart backend service here; simulate with delay & re-fetch
        time.sleep(2)
        persist_resp = requests.get(
            f"{BASE_URL}/api/users/{user_id}/profile",
            headers=auth_headers,
            timeout=TIMEOUT
        )
        assert persist_resp.status_code == 200, f"Profile fetch failed after simulated restart: {persist_resp.text}"
        persisted_data = persist_resp.json()
        assert persisted_data.get("profile") is not None, "Persisted profile missing"
        assert persisted_data.get("profile").get("email") == update_payload["profile"]["email"]

        # Step 5: Verify route aliases if exist (e.g. /profile update alias)
        alias_resp = requests.put(
            f"{BASE_URL}/profile/update",
            json=update_payload,
            headers=auth_headers,
            timeout=TIMEOUT
        )
        if alias_resp.status_code == 404:
            # Alias route may not exist - acceptable
            pass
        else:
            assert alias_resp.status_code == 200, f"Alias endpoint failed with status {alias_resp.status_code}"

        # Step 6: Verify rate limiting by sending 1001 quick requests expect limiting at or below 1000
        rate_limit_exceeded = False
        for i in range(1001):
            rl_resp = requests.get(
                f"{BASE_URL}/api/users/{user_id}/profile",
                headers=auth_headers,
                timeout=TIMEOUT
            )
            if rl_resp.status_code == 429:
                rate_limit_exceeded = True
                break
            assert rl_resp.status_code == 200, f"Unexpected status during rate limit test: {rl_resp.status_code}"
        assert rate_limit_exceeded, "Rate limiting not enforced at 1000 requests"

    finally:
        # Cleanup: delete created user if possible
        if user_id:
            try:
                del_resp = requests.delete(
                    f"{BASE_URL}/api/users/{user_id}",
                    headers=auth_headers if 'auth_headers' in locals() else HEADERS,
                    timeout=TIMEOUT
                )
                # Accept 200 or 204 or 404 (already deleted)
                assert del_resp.status_code in (200, 204, 404), f"User deletion failed: {del_resp.text}"
            except Exception:
                pass


test_user_profile_and_accessibility_preferences_update()
