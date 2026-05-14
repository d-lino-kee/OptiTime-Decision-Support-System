import hmac
import time
from hashlib import sha256

from fastapi import HTTPException, Request, status

from .settings import settings


async def verify_hmac(request: Request) -> bytes:
    """
    Verifies the OptiTime API -> AI service HMAC.

    The NestJS client signs `${timestamp}.${jsonBody}` with HMAC-SHA256 using
    the shared secret and sends the result as headers:
      X-OptiTime-Timestamp: <ms epoch>
      X-OptiTime-Signature: <hex digest>

    We re-derive the signature here and constant-time compare. We also reject
    timestamps older than `hmac_max_skew_seconds` to defeat replay attacks.

    Returns the raw body so handlers can re-parse without double-reading.
    """
    timestamp = request.headers.get("x-optitime-timestamp")
    signature = request.headers.get("x-optitime-signature")
    if not timestamp or not signature:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing signature headers")

    try:
        ts_ms = int(timestamp)
    except ValueError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Bad timestamp") from exc

    skew = abs(time.time() - ts_ms / 1000)
    if skew > settings.hmac_max_skew_seconds:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Stale signature")

    body = await request.body()
    expected = hmac.new(
        settings.ai_service_hmac_secret.encode("utf-8"),
        f"{timestamp}.{body.decode('utf-8')}".encode("utf-8"),
        sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid signature")

    return body
