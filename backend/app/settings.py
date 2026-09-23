"""Configuração do backend lida de variáveis de ambiente (deploy)."""

import os

DEFAULT_CORS_ALLOW_ORIGINS = ("http://localhost:3000",)


def cors_allow_origins() -> list[str]:
    """Origens liberadas no CORS, de `CORS_ALLOW_ORIGINS` (separadas por
    vírgula, ex.: `https://simulador.exemplo.com,https://www.exemplo.com`).
    Sem a variável, libera só o frontend local de desenvolvimento."""
    raw = os.environ.get("CORS_ALLOW_ORIGINS", "")
    origins = [origin.strip().rstrip("/") for origin in raw.split(",") if origin.strip()]
    return origins or list(DEFAULT_CORS_ALLOW_ORIGINS)
