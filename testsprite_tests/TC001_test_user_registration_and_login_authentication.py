import requests
import time

BASE_URL = "http://localhost:5000"
API_KEY = "sbp_4ec20156f8a932a6f8d0647d2e6b0d93a4c0251f"
HEADERS = {"Antigravity": API_KEY, "Content-Type": "application/json"}
REGISTER_ENDPOINT = f"{BASE_URL}/api/auth/register"
LOGIN_ENDPOINT = f"{BASE_URL}/api/auth/login"
TIMEOUT = 30


def test_user_registration_and_login_authentication():
    # User data for registration and login
    user_data = {
        "username": "testuser_tc001",
        "email": "testuser_tc001@example.com",
        "password": "StrongPass!123"
    }

    # 1. Test registration input validation - missing fields
    invalid_payloads = [
        {},  # Completely empty
        {"username": "useronly"},
        {"email": "invalidemail"},
        {"username": "user", "email": "user@example.com"},  # Missing password
        {"username": "u", "email": "u@e.com", "password": "short"},  # weak password
    ]
    for payload in invalid_payloads:
        resp = requests.post(REGISTER_ENDPOINT, json=payload, headers=HEADERS, timeout=TIMEOUT)
        assert resp.status_code >= 400 and resp.status_code < 500, f"Invalid payload {payload} should fail"
        # Response should have error message about validation
        json_resp = resp.json()
        assert "error" in json_resp or "message" in json_resp

    # 2. Register a valid new user
    resp = requests.post(REGISTER_ENDPOINT, json=user_data, headers=HEADERS, timeout=TIMEOUT)
    assert resp.status_code == 201, f"Valid registration failed: {resp.text}"
    json_resp = resp.json()
    assert "id" in json_resp or "user" in json_resp
    user_id = json_resp.get("id") or json_resp.get("user", {}).get("id")
    assert user_id is not None, "User ID missing in registration response"

    try:
        # 3. Test registration with duplicate username/email should fail
        resp_dup = requests.post(REGISTER_ENDPOINT, json=user_data, headers=HEADERS, timeout=TIMEOUT)
        assert resp_dup.status_code >= 400 and resp_dup.status_code < 500, "Duplicate registration should fail"
        dup_json = resp_dup.json()
        assert "error" in dup_json or "message" in dup_json

        # 4. Test login input validation - missing fields
        missing_login_fields = [
            {},
            {"username": "testuser_tc001"},
            {"password": "StrongPass!123"},
            {"username": "wronguser", "password": "StrongPass!123"},
            {"username": "testuser_tc001", "password": "WrongPass!123"},
        ]
        for payload in missing_login_fields:
            resp_login = requests.post(LOGIN_ENDPOINT, json=payload, headers=HEADERS, timeout=TIMEOUT)
            assert resp_login.status_code >= 400 and resp_login.status_code < 500, "Invalid login payload should fail"
            login_json = resp_login.json()
            assert "error" in login_json or "message" in login_json

        # 5. Successful login returns JWT token
        login_payload = {"username": user_data["username"], "password": user_data["password"]}
        resp_login_ok = requests.post(LOGIN_ENDPOINT, json=login_payload, headers=HEADERS, timeout=TIMEOUT)
        assert resp_login_ok.status_code == 200, f"Valid login failed: {resp_login_ok.text}"
        login_json_ok = resp_login_ok.json()
        assert "token" in login_json_ok and isinstance(login_json_ok["token"], str), "JWT token missing or invalid"

        jwt_token = login_json_ok["token"]
        # Check for token validity format (simple check, JWT typically contains 2 dots)
        assert jwt_token.count(".") == 2, "JWT token format invalid"

        # 6. Rate limit check - send 1000 requests within a burst to login to verify limit enforcement
        # Ideally, we want to test that after some limit, requests are denied (429 Too Many Requests)
        # However, to avoid long test, we simulate rate limit check with 50 requests bursts and assert no failures during that
        # Then attempt a large burst to confirm rate limiting on server

        burst_size = 50
        success_count = 0
        for _ in range(burst_size):
            r = requests.post(LOGIN_ENDPOINT, json=login_payload, headers=HEADERS, timeout=TIMEOUT)
            if r.status_code == 200:
                success_count += 1
            elif r.status_code == 429:
                # Too many requests - rate limit triggered
                break
            else:
                # Unexpected failure
                assert False, f"Unexpected status code during rate burst: {r.status_code}"
        assert success_count > 0, "No successful login requests in burst"

        # Now a large burst to try to trigger 429
        triggered_429 = False
        for _ in range(1000):
            r = requests.post(LOGIN_ENDPOINT, json=login_payload, headers=HEADERS, timeout=TIMEOUT)
            if r.status_code == 429:
                triggered_429 = True
                break
        # At some point rate limiting should trigger
        assert triggered_429, "Rate limiting (429) not triggered after 1000 login attempts"

        # 7. Persistence simulation
        # Interim note: Since we cannot restart backend here, simulate by login again after short delay
        time.sleep(2)
        resp_persist = requests.post(LOGIN_ENDPOINT, json=login_payload, headers=HEADERS, timeout=TIMEOUT)
        assert resp_persist.status_code == 200, "Login failed after simulated restart delay"

        # 8. Validate route aliases:
        # Assuming the API supports aliases like /auth/register and /api/auth/register
        alias_endpoints = ["/auth/register", "/api/auth/register", "/auth/login", "/api/auth/login"]
        for ep in alias_endpoints:
            full_url = f"{BASE_URL}{ep}"
            # For register aliases, test method options accordingly
            if "register" in ep:
                r_alias = requests.post(full_url, json=user_data, headers=HEADERS, timeout=TIMEOUT)
                # Should fail for duplicate registration but endpoint works
                assert r_alias.status_code in (400,409), f"Alias endpoint {ep} registration unexpected status"
            elif "login" in ep:
                r_alias_login = requests.post(full_url, json=login_payload, headers=HEADERS, timeout=TIMEOUT)
                assert r_alias_login.status_code == 200, f"Alias endpoint {ep} login failed"

        # 9. Password hashing check verified by absence of plain password in response (implicit)
        # API must not return password in response
        reg_resp_json = resp.json()
        assert "password" not in reg_resp_json and "password" not in str(reg_resp_json).lower()

        # 10. JWT token should be secure - claims test (minimal, as we cannot decode without secret)
        # Confirm token is non-empty string (done above)

    finally:
        # Cleanup: Delete user if API supports deletion (not specified)
        # Attempt delete - if no delete endpoint, skip
        delete_endpoint = f"{BASE_URL}/api/users/{user_id}"
        try:
            del_resp = requests.delete(delete_endpoint, headers=HEADERS, timeout=TIMEOUT)
            # Allow 200,204 or 404 (if already deleted)
            assert del_resp.status_code in (200, 204, 404)
        except requests.RequestException:
            # If no delete endpoint or error, ignore cleanup failure
            pass


test_user_registration_and_login_authentication()
