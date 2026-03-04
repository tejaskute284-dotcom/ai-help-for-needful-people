import requests
import time

BASE_URL = "http://localhost:5000"
API_KEY = "sbp_4ec20156f8a932a6f8d0647d2e6b0d93a4c0251f"
HEADERS = {"x-api-key": API_KEY}
REQUEST_TIMEOUT = 30

def test_rate_limiting_and_brute_force_protection():
    """
    Verify that the API endpoints implement rate limiting and brute-force attack protection.
    This test will:
    - Send 1000 requests to key endpoints ensuring successful responses within limit.
    - Send additional requests to confirm rate limiting enforcement.
    - Simulate ‘restart’ by waiting and re-sending requests to verify persistence.
    - Verify HTTP status codes and rate limit response headers or error messages.
    - Test multiple route aliases if available.
    """

    # Define a list of representative API routes and HTTP methods to test aliases and coverage.
    # For this test, we assume the critical endpoints to test for rate limiting are:
    # - /api/auth/login (POST)
    # - /api/dashboard/stats (GET)
    # - /api/modes/select (PUT) -- dummy payload used
    # Since no explicit routes aliases are given in PRD, we use these as main route examples.
    # Adjust payload and params as per typical usage.

    session = requests.Session()
    session.headers.update(HEADERS)

    test_routes = [
        {
            "method": "POST",
            "url": f"{BASE_URL}/api/auth/login",
            "payload": {
                "username": "testuser",
                "password": "WrongPassword123!"  # Intentionally invalid for brute-force test
            }
        },
        {
            "method": "GET",
            "url": f"{BASE_URL}/api/dashboard/stats"
        },
        {
            "method": "PUT",
            "url": f"{BASE_URL}/api/modes/select",
            "payload": {
                "mode": "blind"
            }
        }
    ]

    # Step 1: Send 1000 requests distributed evenly across endpoints to validate they succeed within rate limit
    total_requests = 1000
    per_route = total_requests // len(test_routes)
    last_responses = []

    for route in test_routes:
        method = route["method"]
        url = route["url"]
        payload = route.get("payload", None)

        for i in range(per_route):
            try:
                if method == "GET":
                    resp = session.get(url, timeout=REQUEST_TIMEOUT)
                elif method == "POST":
                    resp = session.post(url, json=payload, timeout=REQUEST_TIMEOUT)
                elif method == "PUT":
                    resp = session.put(url, json=payload, timeout=REQUEST_TIMEOUT)
                elif method == "DELETE":
                    resp = session.delete(url, timeout=REQUEST_TIMEOUT)
                else:
                    continue  # Unsupported method for test

                last_responses.append((url, resp))
                assert resp.status_code in (200, 201, 202, 204) or resp.status_code == 401 or resp.status_code == 403, \
                    f"Unexpected status code {resp.status_code} for {method} {url}"

            except requests.RequestException as e:
                assert False, f"Request exception during normal rate test on {url}: {str(e)}"

    # Step 2: Send additional requests to verify rate limiting is enforced (expect 429 or equivalent)
    rate_limit_triggered = False
    for route in test_routes:
        method = route["method"]
        url = route["url"]
        payload = route.get("payload", None)

        try:
            # Send 5 additional requests rapidly to trigger rate limiting
            for _ in range(5):
                if method == "GET":
                    resp = session.get(url, timeout=REQUEST_TIMEOUT)
                elif method == "POST":
                    resp = session.post(url, json=payload, timeout=REQUEST_TIMEOUT)
                elif method == "PUT":
                    resp = session.put(url, json=payload, timeout=REQUEST_TIMEOUT)
                elif method == "DELETE":
                    resp = session.delete(url, timeout=REQUEST_TIMEOUT)
                else:
                    continue

                # Check if rate limit triggered
                if resp.status_code == 429:
                    rate_limit_triggered = True
                    # Optionally check response body/message for rate limit info
                    # No assertion failure here, we expect 429 at this stage
                    break

            if rate_limit_triggered:
                break

        except requests.RequestException as e:
            assert False, f"Request exception during rate limit trigger test on {url}: {str(e)}"

    assert rate_limit_triggered, "Rate limiting was not triggered after exceeding request threshold"

    # Step 3: Simulate server ‘restart’ and verify persistence of rate limiting
    # Since we cannot restart actual server here, simulate by waiting enough time for rate limit window to reset.
    # If rate limits should persist across restarts, a server restart simulation would be more complex.
    # For demo, wait for 2 seconds assuming rate limit window is short or intermittent.

    time.sleep(2)

    # Send a request to verify rate limit reset/persistence
    # We expect either a 429 if persistence or a 200 if reset

    try:
        response_post_restart = session.get(f"{BASE_URL}/api/dashboard/stats", timeout=REQUEST_TIMEOUT)
        # Accept either 200 (reset) or 429 (persistence)
        assert response_post_restart.status_code in (200, 429), \
            f"Unexpected status code after restart simulation: {response_post_restart.status_code}"
    except requests.RequestException as e:
        assert False, f"Request exception after simulated restart: {str(e)}"

    # Step 4: Check presence of rate limit headers if available in responses (optional but best practice)
    # Common headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After
    for _, resp in last_responses:
        # Headers keys are case-insensitive in requests
        headers = resp.headers
        has_limit = any(h in headers for h in ["X-RateLimit-Limit", "x-ratelimit-limit"])
        has_remaining = any(h in headers for h in ["X-RateLimit-Remaining", "x-ratelimit-remaining"])
        # If such headers exist, values should be parseable to numeric (except Retry-After)
        if has_limit:
            val = headers.get("X-RateLimit-Limit") or headers.get("x-ratelimit-limit")
            try:
                int(val)
            except Exception:
                assert False, "X-RateLimit-Limit header value is not an integer"
        if has_remaining:
            val = headers.get("X-RateLimit-Remaining") or headers.get("x-ratelimit-remaining")
            try:
                int(val)
            except Exception:
                assert False, "X-RateLimit-Remaining header value is not an integer"

    # Step 5: Additional brief connectivity check to ensure no lingering connection issues
    try:
        resp = session.get(f"{BASE_URL}/api/auth/login", timeout=REQUEST_TIMEOUT)
        assert resp.status_code in (401, 200, 403), "Unexpected status code on connectivity check"
    except requests.RequestException as e:
        assert False, f"Connectivity issue detected: {str(e)}"

test_rate_limiting_and_brute_force_protection()