"""Configuração por variáveis de ambiente (`app.settings`), usada no deploy."""

import pytest

from app.settings import DEFAULT_CORS_ALLOW_ORIGINS, cors_allow_origins


def test_cors_defaults_to_local_frontend(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("CORS_ALLOW_ORIGINS", raising=False)
    assert cors_allow_origins() == list(DEFAULT_CORS_ALLOW_ORIGINS)


def test_cors_reads_comma_separated_origins(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv(
        "CORS_ALLOW_ORIGINS", " https://simulador.exemplo.com/, https://www.exemplo.com ,"
    )
    assert cors_allow_origins() == ["https://simulador.exemplo.com", "https://www.exemplo.com"]


def test_cors_blank_value_falls_back_to_default(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CORS_ALLOW_ORIGINS", " , ")
    assert cors_allow_origins() == list(DEFAULT_CORS_ALLOW_ORIGINS)
