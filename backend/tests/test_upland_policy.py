from app.upland import validate_read_only_request


def test_allows_sanctioned_read_only_endpoint():
    assert validate_read_only_request("GET", "/user/profile") == "/user/profile"


def test_rejects_mutating_methods_even_when_confirmed():
    try:
        validate_read_only_request("POST", "/devshops")
    except ValueError as error:
        assert "read-only" in str(error).lower()
    else:
        raise AssertionError("mutation unexpectedly accepted")


def test_rejects_unknown_and_traversal_endpoints():
    for endpoint in ("/unknown", "/../devshops", "https://evil.example"):
        try:
            validate_read_only_request("GET", endpoint)
        except ValueError:
            continue
        raise AssertionError(f"unsafe endpoint accepted: {endpoint}")
