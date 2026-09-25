import os
import sys
import time

import pytest
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient

# Ensure backend path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from main import (
    MAX_REQUEST_BODY_SIZE,
    sanitize_error_message,
)


# ============================================================================
# 1. SECURITY HEADERS TESTS
# ============================================================================
class TestSecurityHeaders:
    """Validates that hardened security headers are returned on all API endpoints."""

    def test_security_headers_on_health_check(self, client: TestClient):
        response = client.get("/api/health")
        assert response.status_code == 200
        headers = response.headers

        assert headers.get("X-Content-Type-Options") == "nosniff"
        assert headers.get("X-Frame-Options") == "DENY"
        assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
        assert headers.get("X-XSS-Protection") == "1; mode=block"
        assert headers.get("Permissions-Policy") == "camera=(), microphone=(), geolocation=()"

    def test_security_headers_on_demo_endpoint(self, client: TestClient):
        response = client.get("/api/demo")
        assert response.status_code == 200
        headers = response.headers

        assert headers.get("X-Content-Type-Options") == "nosniff"
        assert headers.get("X-Frame-Options") == "DENY"
        assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
        assert headers.get("X-XSS-Protection") == "1; mode=block"
        assert headers.get("Permissions-Policy") == "camera=(), microphone=(), geolocation=()"

    def test_security_headers_on_error_response(self, client: TestClient):
        response = client.post("/api/story/generate", json={})
        assert response.status_code in (400, 422)
        headers = response.headers

        assert headers.get("X-Content-Type-Options") == "nosniff"
        assert headers.get("X-Frame-Options") == "DENY"
        assert headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"


# ============================================================================
# 2. STATIC CACHING HEADERS (ASSETS & INDEX.HTML)
# ============================================================================
class TestCacheControlHeaders:
    """Validates Cache-Control headers for frontend assets and index.html."""

    def test_index_cache_control(self, client: TestClient):
        dist_index = os.path.abspath(os.path.join(backend_path, "..", "dist", "index.html"))
        if os.path.isfile(dist_index):
            response = client.get("/")
            assert response.status_code == 200
            assert "no-cache" in response.headers.get("Cache-Control", "")

    def test_assets_cache_control(self, client: TestClient):
        assets_dir = os.path.abspath(os.path.join(backend_path, "..", "dist", "assets"))
        if os.path.isdir(assets_dir):
            files = os.listdir(assets_dir)
            if files:
                asset_filename = files[0]
                response = client.get(f"/assets/{asset_filename}")
                assert response.status_code == 200
                assert "public" in response.headers.get("Cache-Control", "")
                assert "max-age=31536000" in response.headers.get("Cache-Control", "")
                assert "immutable" in response.headers.get("Cache-Control", "")


# ============================================================================
# 3. DIRECTORY TRAVERSAL PROTECTION TESTS
# ============================================================================
class TestDirectoryTraversalProtection:
    """Tests that all directory traversal vectors are strictly blocked."""

    @pytest.mark.parametrize(
        "payload",
        [
            "../secret.txt",
            "../../windows/win.ini",
            "../../../etc/passwd",
            "..%2f..%2fetc/passwd",
            "%2e%2e%2f%2e%2e%2fetc%2fpasswd",
            "%252e%252e%252fsecret",
            "..\\..\\windows\\system32",
            "index.html%00.txt",
            "C:/Windows/System32/drivers/etc/hosts",
            "assets/../../secret.txt",
        ],
    )
    def test_directory_traversal_attempts_blocked(self, client: TestClient, payload: str):
        response = client.get(f"/{payload}")
        assert response.status_code in (
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_403_FORBIDDEN,
            status.HTTP_404_NOT_FOUND,
        )
        assert response.status_code != 200 or "passwd" not in response.text


# ============================================================================
# 4. REQUEST BODY SIZE LIMITER TESTS
# ============================================================================
class TestRequestBodySizeLimiter:
    """Tests that oversized request payloads are rejected with 413."""

    def test_oversized_payload_rejected_via_content_length(self, client: TestClient):
        # 11 MB Content-Length header
        oversized_len = 11 * 1024 * 1024
        response = client.post(
            "/api/story/generate",
            headers={"Content-Length": str(oversized_len), "Content-Type": "application/json"},
            content=b'{"story_idea": "test"}',
        )
        assert response.status_code == 413
        assert "exceeds maximum allowed size" in response.text

    def test_oversized_payload_rejected_via_body_bytes(self, client: TestClient):
        # 10.5 MB actual bytes
        oversized_data = b"x" * (MAX_REQUEST_BODY_SIZE + 500 * 1024)
        response = client.post(
            "/api/story/generate",
            content=oversized_data,
            headers={"Content-Type": "application/octet-stream"},
        )
        assert response.status_code in (413, 400, 422)

    def test_normal_sized_payload_accepted(self, client: TestClient):
        # Normal small payload should not trigger 413
        response = client.post(
            "/api/settings/verify-key",
            json={"api_key": "test_invalid_key_12345"},
        )
        assert response.status_code != 413


# ============================================================================
# 5. CORS CONFIGURATION TESTS
# ============================================================================
class TestCORSConfiguration:
    """Tests CORS configuration with wildcard and specific origins."""

    def test_wildcard_cors_disallows_credentials(self, client: TestClient):
        response = client.get("/api/health", headers={"Origin": "https://random-site.com"})
        assert response.status_code == 200
        # If wildcard is used, allow_credentials must NOT be true
        if response.headers.get("access-control-allow-origin") == "*":
            assert response.headers.get("access-control-allow-credentials") != "true"

    def test_specific_origins_cors_allows_credentials(self):
        # Test custom app instance configured with specific ALLOWED_ORIGINS
        test_app = FastAPI()
        specific_origins = ["https://comiccraft.ai", "http://localhost:5173"]
        test_app.add_middleware(
            CORSMiddleware,
            allow_origins=specific_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        @test_app.get("/test")
        def test_route():
            return {"ok": True}

        test_client = TestClient(test_app)

        # Trusted origin
        res = test_client.get("/test", headers={"Origin": "https://comiccraft.ai"})
        assert res.headers.get("access-control-allow-origin") == "https://comiccraft.ai"
        assert res.headers.get("access-control-allow-credentials") == "true"

        # Untrusted origin
        untrusted_res = test_client.get("/test", headers={"Origin": "https://malicious.com"})
        assert untrusted_res.headers.get("access-control-allow-origin") is None


# ============================================================================
# 6. RESPONSE COMPRESSION / GZIP TESTS
# ============================================================================
class TestResponseCompression:
    """Tests GZip compression middleware for payloads >= 1000 bytes."""

    def test_gzip_compression_on_large_payload(self, client: TestClient):
        # /api/demo returns rich demo story (> 2000 bytes)
        response = client.get("/api/demo", headers={"Accept-Encoding": "gzip"})
        assert response.status_code == 200
        assert response.headers.get("Content-Encoding") == "gzip"

    def test_no_gzip_when_client_does_not_accept(self, client: TestClient):
        response = client.get("/api/demo", headers={"Accept-Encoding": "identity"})
        assert response.status_code == 200
        assert response.headers.get("Content-Encoding") != "gzip"

    def test_no_gzip_on_small_payload(self, client: TestClient):
        # /api/health returns a short JSON (< 200 bytes)
        response = client.get("/api/health", headers={"Accept-Encoding": "gzip"})
        assert response.status_code == 200
        # Responses under 1000 bytes should not be gzipped
        assert response.headers.get("Content-Encoding") != "gzip"


# ============================================================================
# 7. ERROR MESSAGE SANITIZATION TESTS
# ============================================================================
class TestErrorSanitization:
    """Tests that API keys, file system paths, and tracebacks are never leaked."""

    def test_sanitize_gemini_api_key(self):
        leaked_key = "AIzaSy" + "A" * 33
        error_msg = f"Failed to connect using key {leaked_key} at endpoint."
        sanitized = sanitize_error_message(error_msg)
        assert leaked_key not in sanitized
        assert "[REDACTED_API_KEY]" in sanitized

    def test_sanitize_query_param_key(self):
        error_msg = (
            "https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSy_Secret_Token_12345"
        )
        sanitized = sanitize_error_message(error_msg)
        assert "AIzaSy_Secret_Token_12345" not in sanitized
        assert "key=[REDACTED]" in sanitized

    def test_sanitize_bearer_token(self):
        error_msg = "Request unauthorized: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
        sanitized = sanitize_error_message(error_msg)
        assert "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" not in sanitized
        assert "Bearer [REDACTED]" in sanitized

    def test_sanitize_filesystem_paths(self):
        win_path = r"C:\Users\sudhar\Documents\ComicCraft_AI\secret.env"
        error_msg = f"File open error on {win_path}"
        sanitized = sanitize_error_message(error_msg)
        assert "C:\\Users" not in sanitized
        assert "[INTERNAL_PATH]" in sanitized

    def test_sanitized_500_exception_handler(self):
        test_app = FastAPI()

        from main import http_exception_handler

        test_app.add_exception_handler(HTTPException, http_exception_handler)

        @test_app.get("/error-test")
        def route_with_error():
            secret_key = "AIzaSy" + "Z" * 33
            raise HTTPException(
                status_code=500,
                detail=f"Fatal DB Error on C:\\Server\\App\\db: key={secret_key}",
            )

        client = TestClient(test_app)
        res = client.get("/error-test")
        assert res.status_code == 500
        detail = res.json().get("detail", "")
        assert "AIzaSy" not in detail
        assert "C:\\Server" not in detail
        assert "[REDACTED" in detail or "[INTERNAL_PATH]" in detail


# ============================================================================
# 8. PERFORMANCE BENCHMARKS (< 50ms)
# ============================================================================
class TestPerformanceBenchmarks:
    """Benchmarks critical endpoint response times under typical load."""

    def test_health_check_response_time_under_50ms(self, client: TestClient):
        # Warm-up run
        for _ in range(5):
            client.get("/api/health")

        iterations = 50
        durations: list[float] = []

        for _ in range(iterations):
            start = time.perf_counter()
            res = client.get("/api/health")
            duration_ms = (time.perf_counter() - start) * 1000
            assert res.status_code == 200
            durations.append(duration_ms)

        avg_latency_ms = sum(durations) / len(durations)
        p95_latency_ms = sorted(durations)[int(iterations * 0.95)]
        print(
            f"\n[Benchmark] /api/health -> Avg: {avg_latency_ms:.2f}ms, P95: {p95_latency_ms:.2f}ms"
        )

        assert avg_latency_ms < 50.0, f"Average latency {avg_latency_ms:.2f}ms exceeds 50ms SLA"

    def test_demo_endpoint_response_time_under_50ms(self, client: TestClient):
        # Warm-up run
        for _ in range(5):
            client.get("/api/demo")

        iterations = 50
        durations: list[float] = []

        for _ in range(iterations):
            start = time.perf_counter()
            res = client.get("/api/demo")
            duration_ms = (time.perf_counter() - start) * 1000
            assert res.status_code == 200
            durations.append(duration_ms)

        avg_latency_ms = sum(durations) / len(durations)
        p95_latency_ms = sorted(durations)[int(iterations * 0.95)]
        print(
            f"\n[Benchmark] /api/demo -> Avg: {avg_latency_ms:.2f}ms, P95: {p95_latency_ms:.2f}ms"
        )

        assert avg_latency_ms < 50.0, f"Average latency {avg_latency_ms:.2f}ms exceeds 50ms SLA"
