import requests
import time

BASE_URL = "http://localhost:5000"
API_KEY = "sbp_4ec20156f8a932a6f8d0647d2e6b0d93a4c0251f"
HEADERS = {"Authorization": f"ApiKey {API_KEY}"}
TIMEOUT = 30

def test_dashboard_accessibility_statistics_retrieval():
    stats_endpoint = f"{BASE_URL}/dashboard/accessibility-statistics"
    rate_limit_max = 1000

    # Function to validate the structure and content of the response
    def validate_stats_response(json_data):
        assert isinstance(json_data, dict), "Response is not a JSON object"
        # Expected top-level keys based on dashboard metrics and compliance
        expected_keys = ['statistics', 'compliance', 'visualization']
        for key in expected_keys:
            assert key in json_data, f"Missing key '{key}' in response"

        # Validate statistics is a dict with numeric values
        statistics = json_data['statistics']
        assert isinstance(statistics, dict), "'statistics' must be an object"
        for metric, value in statistics.items():
            assert isinstance(value, (int, float)), f"Statistic '{metric}' value must be numeric"

        # Validate compliance contains percentages or boolean indicators
        compliance = json_data['compliance']
        assert isinstance(compliance, dict), "'compliance' must be an object"
        for metric, value in compliance.items():
            # Allow compliance values as float percentages between 0-100 or bool
            if isinstance(value, (int, float)):
                assert 0 <= value <= 100, f"Compliance metric '{metric}' out of 0-100 range"
            else:
                assert isinstance(value, bool), f"Compliance metric '{metric}' must be bool or percentage"

        # Validate visualization support: expect keys for charts/trends description
        visualization = json_data['visualization']
        assert isinstance(visualization, dict), "'visualization' must be an object"
        viz_keys = ['charts', 'trends']
        for k in viz_keys:
            assert k in visualization, f"Missing visualization key '{k}'"
            # The values should be list or dict representing the chart data configurations
            assert isinstance(visualization[k], (list, dict)), f"Visualization '{k}' should be list or dict"

    # 1. Test normal retrieval and correctness of data
    try:
        response = requests.get(stats_endpoint, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
        json_data = response.json()
        validate_stats_response(json_data)
    except (requests.RequestException, AssertionError, ValueError) as e:
        raise AssertionError(f"Dashboard statistics retrieval failed: {e}")

    # 2. Test rate limiting by sending 1000 requests sequentially and expect no 429
    try:
        for i in range(rate_limit_max):
            r = requests.get(stats_endpoint, headers=HEADERS, timeout=TIMEOUT)
            # Allow 200 or 304 (not modified) as success, no 429
            assert r.status_code in (200, 304), f"Unexpected status code {r.status_code} on request {i+1}"
        # The 1001th request should be rate limited (>= 429)
        r = requests.get(stats_endpoint, headers=HEADERS, timeout=TIMEOUT)
        assert r.status_code == 429, "Rate limiting not enforced after 1000 requests"
    except AssertionError as ae:
        raise ae
    except requests.RequestException as re:
        raise AssertionError(f"Error during rate limit test: {re}")

    # 3. Simulate a server 'restart' by waiting or calling a special endpoint if exists
    # Since no restart endpoint is specified, we simulate by waiting and re-requesting:
    time.sleep(2)  # simulate restart wait

    try:
        # Confirm persistence after 'restart' by re-requesting
        response_after_restart = requests.get(stats_endpoint, headers=HEADERS, timeout=TIMEOUT)
        assert response_after_restart.status_code == 200, f"Expected 200 OK after restart, got {response_after_restart.status_code}"
        validate_stats_response(response_after_restart.json())
    except (requests.RequestException, AssertionError, ValueError) as e:
        raise AssertionError(f"Dashboard statistics retrieval failed after simulated restart: {e}")

    # 4. Test all known route aliases for this endpoint if any
    # No aliases explicitly given in PRD, but assume '/dashboard/stats' and '/stats' as plausible aliases
    route_aliases = [
        f"{BASE_URL}/dashboard/stats",
        f"{BASE_URL}/stats"
    ]
    for alias in route_aliases:
        try:
            alias_resp = requests.get(alias, headers=HEADERS, timeout=TIMEOUT)
            # Either alias not implemented (404) or valid, check for valid response if 200
            if alias_resp.status_code == 200:
                validate_stats_response(alias_resp.json())
            else:
                # Accept 404 as no alias implemented but no error raised
                assert alias_resp.status_code in (404, 405), f"Unexpected status code {alias_resp.status_code} for alias {alias}"
        except (requests.RequestException, AssertionError, ValueError) as e:
            raise AssertionError(f"Alias route test failed for {alias}: {e}")

    # 5. Final connectivity check - one GET request to confirm service availability
    try:
        final_check_resp = requests.get(stats_endpoint, headers=HEADERS, timeout=TIMEOUT)
        assert final_check_resp.status_code == 200, "Final connectivity check failed"
    except (requests.RequestException, AssertionError) as e:
        raise AssertionError(f"Final connectivity check failed: {e}")


# Run the test
test_dashboard_accessibility_statistics_retrieval()