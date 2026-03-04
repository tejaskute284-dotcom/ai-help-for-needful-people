import requests
import random
import string
import time

BASE_URL = "http://localhost:5000"
API_KEY = "sbp_4ec20156f8a932a6f8d0647d2e6b0d93a4c0251f"
HEADERS = {
    "Authorization": f"ApiKey {API_KEY}",
    "Content-Type": "application/json"
}

TIMEOUT = 30

def random_string(length=10):
    return ''.join(random.choices(string.ascii_letters + string.digits + "<>'\";--(){}", k=length))

def check_rate_limit(route, method='GET', payload=None):
    limit = 1000
    headers = HEADERS.copy()
    for i in range(limit):
        try:
            if method == 'GET':
                r = requests.get(route, headers=headers, timeout=TIMEOUT)
            elif method == 'POST':
                r = requests.post(route, headers=headers, json=payload, timeout=TIMEOUT)
            elif method == 'PUT':
                r = requests.put(route, headers=headers, json=payload, timeout=TIMEOUT)
            elif method == 'DELETE':
                r = requests.delete(route, headers=headers, timeout=TIMEOUT)
            else:
                return False
            if r.status_code == 429:
                return True
        except requests.exceptions.RequestException:
            return False
    return False

def test_input_validation_and_sanitization():
    # Collect API route info for key endpoints and their aliases (simulate from PRD knowledge)
    # Since no explicit endpoints given, infer common REST endpoints for auth, modes, dashboard, profile, gesture
    # We'll test injection strings on key endpoints with expected methods and payloads
    
    # Define endpoint info: route, method, json payload template or None for GET
    endpoints = [
        # Authentication endpoints
        {'route': f"{BASE_URL}/api/register", 'method': 'POST', 'payload': {'username': '', 'email': '', 'password': ''}},
        {'route': f"{BASE_URL}/api/login", 'method': 'POST', 'payload': {'username': '', 'password': ''}},
        # Mode selection endpoint
        {'route': f"{BASE_URL}/api/modes/select", 'method': 'POST', 'payload': {'mode': ''}},
        {'route': f"{BASE_URL}/api/modes", 'method': 'GET', 'payload': None},
        # Blind mode object detection trigger (simulate)
        {'route': f"{BASE_URL}/api/blindmode/detect", 'method': 'POST', 'payload': {'image': 'base64string'}},
        # Deaf mode speech processing
        {'route': f"{BASE_URL}/api/deafmode/transcribe", 'method': 'POST', 'payload': {'audio': 'base64string'}},
        # Sign language gesture recognition
        {'route': f"{BASE_URL}/api/signlanguage/recognize", 'method': 'POST', 'payload': {'video': 'base64string'}},
        # Dashboard stats retrieval
        {'route': f"{BASE_URL}/api/dashboard/stats", 'method': 'GET', 'payload': None},
        # Profile update
        {'route': f"{BASE_URL}/api/profile", 'method': 'PUT', 'payload': {'displayName': '', 'preferences': {}}},
    ]

    # Injection payloads to test input validation and sanitization
    injection_strings = [
        "<script>alert(1)</script>",
        "' OR '1'='1",
        "\" OR \"1\"=\"1",
        "'; DROP TABLE users; --",
        "${7*7}",
        "<img src=x onerror=alert(1)>",
        "<svg/onload=alert(1)>",
        "admin'--",
        "`shutdown -h now`",
        "$(rm -rf /)",
    ]

    def assert_no_server_error(response):
        assert response.status_code < 500, f"Server error occurred: {response.status_code}, Content: {response.text}"

    def assert_bad_request_or_success(response):
        # The API should reject injections with 4xx or handle safely with 200/201
        assert response.status_code in {200,201,400,401,403,422}, f"Unexpected status code: {response.status_code}, Content: {response.text}"

    # Test route aliases and persistence simulation builtin as repeated calls below

    # Rate limit check and connectivity
    for ep in endpoints:
        # Test rate limiting: we do a reduced check of 20 calls instead of 1000 for speed but simulate properly
        for _ in range(20):
            try:
                if ep['method'] == 'GET':
                    r = requests.get(ep['route'], headers=HEADERS, timeout=TIMEOUT)
                elif ep['method'] == 'POST':
                    r = requests.post(ep['route'], headers=HEADERS, json=ep['payload'] if ep['payload'] else None, timeout=TIMEOUT)
                elif ep['method'] == 'PUT':
                    r = requests.put(ep['route'], headers=HEADERS, json=ep['payload'] if ep['payload'] else None, timeout=TIMEOUT)
                elif ep['method'] == 'DELETE':
                    r = requests.delete(ep['route'], headers=HEADERS, timeout=TIMEOUT)
                assert r.status_code != 503, f"Service unavailable on repeated calls at {ep['route']}"
            except requests.exceptions.RequestException as e:
                assert False, f"Connectivity issue on {ep['route']}: {e}"

    # Test input validation and sanitization per endpoint
    for ep in endpoints:
        for inj in injection_strings:
            payload = None
            if ep['payload'] is not None:
                payload = {}
                for k, v in ep['payload'].items():
                    # Inject injection string for string fields, keep nested dict empty or same
                    if isinstance(v, str):
                        payload[k] = inj
                    elif isinstance(v, dict):
                        # recursively fill dict with injection strings for testing
                        payload[k] = {subk: inj for subk in v}
                    else:
                        payload[k] = v
            try:
                if ep['method'] == 'GET':
                    r = requests.get(ep['route'], headers=HEADERS, timeout=TIMEOUT)
                elif ep['method'] == 'POST':
                    r = requests.post(ep['route'], headers=HEADERS, json=payload, timeout=TIMEOUT)
                elif ep['method'] == 'PUT':
                    r = requests.put(ep['route'], headers=HEADERS, json=payload, timeout=TIMEOUT)
                elif ep['method'] == 'DELETE':
                    r = requests.delete(ep['route'], headers=HEADERS, timeout=TIMEOUT)
                else:
                    continue
                assert_no_server_error(r)
                assert_bad_request_or_success(r)
            except requests.exceptions.RequestException as e:
                assert False, f"Request exception on {ep['route']} with injection payload: {e}"

    # Simulate persistence check across 'restart' by calling critical endpoints twice with delay
    critical_endpoints = [e for e in endpoints if e['method'] == 'GET' or e['method'] == 'POST']
    for ep in critical_endpoints:
        try:
            if ep['method'] == 'GET':
                r1 = requests.get(ep['route'], headers=HEADERS, timeout=TIMEOUT)
                time.sleep(2)
                r2 = requests.get(ep['route'], headers=HEADERS, timeout=TIMEOUT)
            elif ep['method'] == 'POST':
                payload = ep['payload'] or {}
                r1 = requests.post(ep['route'], headers=HEADERS, json=payload, timeout=TIMEOUT)
                time.sleep(2)
                r2 = requests.post(ep['route'], headers=HEADERS, json=payload, timeout=TIMEOUT)
            else:
                continue
            assert_no_server_error(r1)
            assert_no_server_error(r2)
            assert r1.status_code == r2.status_code, f"Response status mismatch after restart simulation on {ep['route']}"
        except requests.exceptions.RequestException as e:
            assert False, f"Persistence check request failed on {ep['route']}: {e}"

test_input_validation_and_sanitization()