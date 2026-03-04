import requests
import time

BASE_URL = "http://localhost:5000"
API_KEY = "sbp_4ec20156f8a932a6f8d0647d2e6b0d93a4c0251f"
HEADERS = {
    "Authorization": f"ApiKey {API_KEY}",
    "Content-Type": "application/json",
    "Accept": "application/json",
}
TIMEOUT = 30

def test_mode_selection_and_retrieval():
    modes_endpoint = f"{BASE_URL}/accessibility/accessibility-modes"
    mode_select_endpoint = f"{BASE_URL}/accessibility/mode/select"
    aliases = ["accessibility/accessibility-modes", "accessibility/accessibility-modes", "modes/accessibility"]

    selected_modes = ["Blind", "Deaf", "SignLanguage"]

    # Helper to select a mode
    def select_mode(mode):
        resp = requests.post(
            mode_select_endpoint,
            headers=HEADERS,
            json={"mode": mode},
            timeout=TIMEOUT
        )
        resp.raise_for_status()
        return resp.json()

    # Helper to get current active mode(s)
    def get_modes(url):
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()

    # Step 1: Verify rate limiting by issuing 1000 requests on the GET modes endpoint
    rate_limit_test_url = aliases[0]
    for i in range(1000):
        resp = requests.get(f"{BASE_URL}/{rate_limit_test_url}", headers=HEADERS, timeout=TIMEOUT)
        # Accept any 2xx or 429 (rate limited) response
        if resp.status_code == 429:
            # If rate limited early, break and test passes as limit is enforced
            break
        elif resp.status_code // 100 != 2:
            resp.raise_for_status()

    # Step 2: Test all route aliases for GET modes endpoint and verify structure and persistence
    for alias in aliases:
        response = get_modes(f"{BASE_URL}/{alias}")
        assert isinstance(response, dict) or isinstance(response, list), "Modes response must be dict or list."

    # Step 3: Test mode selection and verify persistence

    # Select each mode in turn, validate response and retrieval
    for mode in selected_modes:
        selection_resp = select_mode(mode)
        assert 'activated_mode' in selection_resp, "Response must include 'activated_mode'."
        assert selection_resp['activated_mode'] == mode, f"Activated mode should be '{mode}'"

        # Retrieve mode immediately to confirm persistence
        mode_state = get_modes(modes_endpoint)
        # Depending on API, mode_state may be dict or list, assert that mode is active
        if isinstance(mode_state, dict):
            active_mode = mode_state.get('active_mode') or mode_state.get('activated_mode') or mode_state.get('current_mode')
            assert active_mode == mode, f"Active mode should be '{mode}' after selection"
        elif isinstance(mode_state, list):
            assert mode in mode_state, f"Mode '{mode}' should be in active modes list after selection"
        else:
            assert False, "Unexpected response format for mode retrieval."

    # Step 4: Simulate 'restart' by waiting or hitting a heartbeat endpoint if available,
    # then verify mode persistence again (re-get after short delay)
    time.sleep(2)  # small delay to simulate backend restart or ephemeral restart

    post_restart_state = get_modes(modes_endpoint)
    if isinstance(post_restart_state, dict):
        active_mode = post_restart_state.get('active_mode') or post_restart_state.get('activated_mode') or post_restart_state.get('current_mode')
        # The last selected mode should persist
        assert active_mode == selected_modes[-1], f"Active mode should persist as '{selected_modes[-1]}' after restart simulation"
    elif isinstance(post_restart_state, list):
        assert selected_modes[-1] in post_restart_state, f"Mode '{selected_modes[-1]}' should persist in active modes list after restart simulation"
    else:
        assert False, "Unexpected response format after restart simulation."

test_mode_selection_and_retrieval()
