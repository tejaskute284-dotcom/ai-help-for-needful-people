import requests
import time

BASE_URL = "http://localhost:5000"
API_KEY = "sbp_4ec20156f8a932a6f8d0647d2e6b0d93a4c0251f"
HEADERS = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_jwt_token_validation_and_session_management():
    # 1. Register a new user to get a valid JWT token (assuming /auth/register and /auth/login)
    register_payload = {
        "username": "testuser_tc008",
        "email": "testuser_tc008@example.com",
        "password": "StrongPassw0rd!"
    }
    login_payload = {
        "username": "testuser_tc008",
        "password": "StrongPassw0rd!"
    }

    user_id = None
    jwt_token = None

    try:
        # Register user
        r = requests.post(f"{BASE_URL}/auth/register", json=register_payload, headers=HEADERS, timeout=TIMEOUT)
        assert r.status_code == 201 or r.status_code == 200, f"Registration failed: {r.status_code} {r.text}"
        register_resp = r.json()
        user_id = register_resp.get("id") or register_resp.get("user_id")
        assert user_id is not None, "User ID not returned on registration"

        # Login user
        r = requests.post(f"{BASE_URL}/auth/login", json=login_payload, headers=HEADERS, timeout=TIMEOUT)
        assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
        login_resp = r.json()
        jwt_token = login_resp.get("token") or login_resp.get("jwt")
        assert jwt_token is not None, "JWT token not returned on login"

        auth_headers = {**HEADERS, "Authorization": f"Bearer {jwt_token}"}

        # 2. Verify valid token access protected endpoint (/dashboard/profile or /user/profile assumed)
        r = requests.get(f"{BASE_URL}/user/profile", headers=auth_headers, timeout=TIMEOUT)
        assert r.status_code == 200, f"Access with valid JWT failed: {r.status_code} {r.text}"

        # 3. Verify invalid token rejected
        invalid_headers = {**HEADERS, "Authorization": "Bearer invalidtoken123"}
        r = requests.get(f"{BASE_URL}/user/profile", headers=invalid_headers, timeout=TIMEOUT)
        assert r.status_code in (401,403), f"Invalid JWT token accepted: {r.status_code} {r.text}"

        # 4. Verify no token rejected
        r = requests.get(f"{BASE_URL}/user/profile", headers=HEADERS, timeout=TIMEOUT)
        assert r.status_code in (401,403), f"No JWT token accepted: {r.status_code} {r.text}"

        # 5. Verify session persistence simulation - by token reuse after simulated restart
        # Simulate restart by waiting and doing another call with same token
        time.sleep(2)
        r = requests.get(f"{BASE_URL}/user/profile", headers=auth_headers, timeout=TIMEOUT)
        assert r.status_code == 200, f"Token not persistent after wait: {r.status_code} {r.text}"

        # 6. Verify route aliases for /user/profile (try /profile and /dashboard/profile if applicable)
        for alias in ["/profile", "/dashboard/profile"]:
            r = requests.get(f"{BASE_URL}{alias}", headers=auth_headers, timeout=TIMEOUT)
            assert r.status_code == 200, f"Route alias {alias} failed: {r.status_code} {r.text}"

        # 7. Verify rate limiting (max 1000 requests)
        # We'll test by sending 1001 rapid requests to /user/profile and expect last to be rejected
        success_count = 0
        rate_limit_exceeded = False
        for i in range(1001):
            r = requests.get(f"{BASE_URL}/user/profile", headers=auth_headers, timeout=TIMEOUT)
            if r.status_code == 200:
                success_count += 1
            elif r.status_code == 429:
                rate_limit_exceeded = True
                break
            else:
                # Any other error should fail test
                assert False, f"Unexpected status during rate limit test: {r.status_code} {r.text}"
        assert success_count <= 1000, "More than 1000 requests succeeded, rate limit failed"
        assert rate_limit_exceeded is True, "Rate limit not enforced (429 missing after limit)"
    finally:
        # Delete user to cleanup if endpoint exists (assuming DELETE /user/{id})
        if user_id:
            try:
                delete_headers = {**HEADERS}
                if jwt_token:
                    delete_headers["Authorization"] = f"Bearer {jwt_token}"
                requests.delete(f"{BASE_URL}/user/{user_id}", headers=delete_headers, timeout=TIMEOUT)
            except Exception:
                pass

test_jwt_token_validation_and_session_management()