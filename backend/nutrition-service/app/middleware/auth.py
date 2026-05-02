"""JWT verification middleware.

Tokens are issued by the user-service. Both services share ``JWT_SECRET``.
Access tokens carry a ``type: 'access'`` claim — we reject anything else
(refresh, reset) to prevent token misuse.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt

from app.config.settings import settings


@dataclass(frozen=True)
class AuthenticatedUser:
    user_id: str
    email: str


def _unauthorized(message: str = "Authentication required") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"message": message, "code": "UNAUTHORIZED"},
        headers={"WWW-Authenticate": "Bearer"},
    )


def _invalid_token(message: str = "Token is invalid or expired") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={"message": message, "code": "INVALID_TOKEN"},
    )


async def get_current_user(authorization: Optional[str] = Header(default=None)) -> AuthenticatedUser:
    """FastAPI dependency that resolves the bearer token to an authenticated user."""

    if not authorization:
        raise _unauthorized("Authorization header is required")
    if not authorization.startswith("Bearer "):
        raise _unauthorized("Authorization header must use Bearer scheme")

    token = authorization[len("Bearer ") :].strip()
    if not token:
        raise _unauthorized("Bearer token is empty")

    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError:
        raise _invalid_token() from None

    token_type = payload.get("type")
    if token_type and token_type != "access":
        raise _invalid_token("Token is not an access token")

    user_id = payload.get("userId")
    email = payload.get("email")
    if not user_id or not email:
        raise _invalid_token("Token is missing required claims")

    return AuthenticatedUser(user_id=user_id, email=email)


def assert_owner(authenticated: AuthenticatedUser, user_id: str) -> None:
    """Forbid cross-user access. Raises 403 if the path/body user_id doesn't
    match the authenticated user."""
    if str(authenticated.user_id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"message": "Forbidden", "code": "FORBIDDEN"},
        )


CurrentUser = Depends(get_current_user)
