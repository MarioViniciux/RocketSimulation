"""Documentação OpenAPI da API (Swagger UI em `/docs`): metadados dos
endpoints e, principalmente, os exemplos de payload de `POST /simulate`
(`app.docs.ROCKET_CONFIG_EXAMPLES`) — cada exemplo precisa se comportar
exatamente como a sua descrição promete, para a documentação não ficar
defasada em relação à API."""

from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.docs import ROCKET_CONFIG_EXAMPLES, SIMULATION_ERROR_RESPONSE_EXAMPLES
from app.main import app
from app.schemas import ErrorResponse

client = TestClient(app)


def _openapi() -> dict[str, Any]:
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema: dict[str, Any] = response.json()
    return schema


def test_swagger_ui_and_redoc_are_served() -> None:
    assert client.get("/docs").status_code == 200
    assert client.get("/redoc").status_code == 200


def test_root_redirects_to_swagger_ui() -> None:
    response = client.get("/", follow_redirects=False)
    assert response.status_code in (302, 307)
    assert response.headers["location"] == "/docs"


def test_openapi_documents_units_and_error_conventions() -> None:
    info = _openapi()["info"]
    assert info["version"]
    assert "SI" in info["description"]
    assert "ponta da coifa" in info["description"]
    assert "422" in info["description"]


def test_every_endpoint_has_tag_and_summary() -> None:
    for path, operations in _openapi()["paths"].items():
        for method, operation in operations.items():
            assert operation.get("tags"), f"{method.upper()} {path} sem tag"
            assert operation.get("summary"), f"{method.upper()} {path} sem summary"


def test_simulate_documents_request_examples_and_422_response() -> None:
    operation = _openapi()["paths"]["/simulate"]["post"]
    request_examples = operation["requestBody"]["content"]["application/json"]["examples"]
    assert set(request_examples) == set(ROCKET_CONFIG_EXAMPLES)

    error_response = operation["responses"]["422"]["content"]["application/json"]
    assert error_response["schema"]["$ref"].endswith("/ErrorResponse")
    assert set(error_response["examples"]) == set(SIMULATION_ERROR_RESPONSE_EXAMPLES)


def test_every_documented_field_has_a_description() -> None:
    """Todo campo dos schemas de entrada/saída aparece com descrição no
    Swagger UI (a unidade SI vem da descrição — ver `test_schema_units.py`)."""
    schemas = _openapi()["components"]["schemas"]

    def has_description(field_schema: dict[str, Any]) -> bool:
        if "description" in field_schema:
            return True
        # O Pydantic omite a descrição do campo quando ela é igual à do
        # sub-modelo referenciado (a docstring), que já aparece no Swagger.
        ref = field_schema.get("$ref")
        return ref is not None and "description" in schemas[ref.rsplit("/", 1)[-1]]

    missing = [
        f"{name}.{field}"
        for name, schema in schemas.items()
        if name not in ("HTTPValidationError", "ValidationError")
        for field, field_schema in schema.get("properties", {}).items()
        if not has_description(field_schema)
    ]
    assert missing == []


@pytest.mark.parametrize(
    ("example_name", "expected_status"),
    [
        ("estavel_sem_drogue", 200),
        ("estavel_com_drogue", 200),
        ("instavel", 422),
        ("fora_dos_limites", 422),
    ],
)
def test_rocket_config_example_behaves_as_documented(
    example_name: str, expected_status: int
) -> None:
    example = ROCKET_CONFIG_EXAMPLES[example_name]
    assert f"({expected_status}" in example["summary"]

    response = client.post("/simulate", json=example["value"])

    assert response.status_code == expected_status
    body = response.json()
    if expected_status == 200:
        has_drogue = example["value"]["recovery"]["has_drogue"]
        assert (body["drogue_terminal_velocity_m_s"] is not None) == has_drogue
    else:
        # Ambas as formas de erro seguem o `ErrorResponse` documentado.
        ErrorResponse.model_validate(body)
        detail_is_text = isinstance(body["detail"], str)
        assert detail_is_text == ("textual" in example["summary"])


def test_error_response_examples_match_the_documented_schema() -> None:
    for example in SIMULATION_ERROR_RESPONSE_EXAMPLES.values():
        ErrorResponse.model_validate(example["value"])
