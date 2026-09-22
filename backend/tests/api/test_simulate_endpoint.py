"""Testes de integração do endpoint `POST /simulate` (via `TestClient`).

Diferem dos testes unitários em `tests/simulation/`: aqui o alvo é a API
FastAPI completa — validação de payload pelo Pydantic, orquestração em
`run_simulation` e o mapeamento de `SimulationError` para HTTP 422 — e não
os modelos físicos isoladamente. Um `RocketConfig` base, fisicamente
plausível e estável, é usado como ponto de partida e mutado por teste.
"""

import copy
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _valid_rocket_config_payload() -> dict[str, Any]:
    """`RocketConfig` fisicamente plausível, estável (margem ~1.1 cal) e com
    empuxo médio (~1017 N) bem acima do peso na decolagem (~75 N)."""
    return {
        "propulsion": {
            "combustion_chamber": {"length_m": 0.5, "diameter_m": 0.1, "empty_mass_kg": 1.0},
            "propellant_grain": {
                "propellant_mass_kg": 2.0,
                "grain_count": 4,
                "grain_diameter_m": 0.08,
                "single_grain_burn_time_s": 0.75,
            },
            "nozzle": {
                "throat_diameter_m": 0.03,
                "exit_diameter_m": 0.08,
                "length_m": 0.1,
                "position_m": 2.0,
            },
            "dry_inertia": {"dry_inertia_kg_m2": 0.5, "dry_center_of_mass_m": 1.8},
            "thermodynamic_impulse_parameters": {
                "reference_pressure_pa": 5_000_000.0,
                "total_impulse_ns": 2000.0,
                "pressure_impulse_ns": 50.0,
                "exhaust_velocity_m_s": 1500.0,
            },
        },
        "avionics": {
            "mass_kg": 0.5,
            "position_x_m": 0.3,
            "position_y_m": 0.0,
            "position_z_m": 0.0,
            "diameter_m": 0.08,
            "length_m": 0.15,
        },
        "payload": {
            "mass_kg": 0.5,
            "position_x_m": 0.6,
            "position_y_m": 0.0,
            "position_z_m": 0.0,
            "diameter_m": 0.08,
            "length_m": 0.15,
        },
        "structure": {
            "empty_mass_kg": 3.0,
            "total_length_m": 2.0,
            "body_diameter_m": 0.1,
            "center_of_mass_m": 1.0,
            "drag_coefficient": 0.45,
            "nose_cone": {"shape": "ogival", "length_m": 0.3, "mass_kg": 0.3},
            "fins": {
                "count": 3,
                "mounting_angle_deg": 0.0,
                "root_chord_m": 0.15,
                "tip_chord_m": 0.07,
                "semispan_m": 0.08,
                "mid_chord_sweep_m": 0.05,
                "root_leading_edge_position_m": 1.85,
            },
            "rail_buttons": {"count": 2, "angle_deg": 180.0},
        },
        "recovery": {
            "has_drogue": False,
            "lower_support_mass_kg": 0.2,
            "parachutes_mass_kg": 0.3,
            "piston_cap_mass_kg": 0.1,
            "ejection_charge_mass_kg": 0.005,
            "center_of_mass_m": 1.6,
            "predicted_terminal_velocity_m_s": 6.0,
            "drogue_deployment_time_s": None,
            "drogue_drag_coefficient": None,
            "drogue_diameter_m": None,
            "main_deployment_time_s": 5.0,
            "main_drag_coefficient": 1.5,
            "main_diameter_m": 1.5,
            "predicted_search_radius_m": 500.0,
        },
        "environment": {
            "latitude_deg": -23.5,
            "longitude_deg": -46.6,
            "elevation_m": 800.0,
            "wind_speed_m_s": 2.0,
            "launch_rail_length_m": 3.0,
            "launch_rail_angle_deg": 5.0,
        },
    }


def test_health_check_returns_ok() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_simulate_returns_structured_results_for_a_valid_stable_rocket() -> None:
    response = client.post("/simulate", json=_valid_rocket_config_payload())
    assert response.status_code == 200

    body = response.json()
    assert body["apogee_altitude_m"] > 0.0
    assert body["stability_margin_calibers"] > 0.0
    # burn_time_s = grain_count * single_grain_burn_time_s = 4 * 0.75, determinístico.
    assert body["burn_time_s"] == 3.0
    assert body["drogue_terminal_velocity_m_s"] is None  # has_drogue=False
    assert body["main_terminal_velocity_m_s"] > 0.0

    time_series = body["time_series"]
    times_s = time_series["times_s"]
    altitudes_m = time_series["altitudes_m"]
    assert len(times_s) > 1
    assert len(altitudes_m) == len(times_s)
    assert len(time_series["vertical_velocities_m_s"]) == len(times_s)
    assert len(time_series["vertical_accelerations_m_s2"]) == len(times_s)
    assert times_s[0] == 0.0
    assert times_s == sorted(times_s)
    assert max(altitudes_m) == pytest.approx(body["apogee_altitude_m"], rel=1e-2)


def test_simulate_rejects_unstable_rocket_configuration_with_422() -> None:
    payload = copy.deepcopy(_valid_rocket_config_payload())
    # Aletas quase sem área e coladas ao nariz: o CP migra para perto do
    # nariz (dominado pela coifa), muito à frente do CM -> margem negativa.
    payload["structure"]["fins"]["semispan_m"] = 0.01
    payload["structure"]["fins"]["root_leading_edge_position_m"] = 0.0

    response = client.post("/simulate", json=payload)

    assert response.status_code == 422
    detail = response.json()["detail"]
    assert isinstance(detail, str)
    assert "instável" in detail.lower()


def test_simulate_rejects_insufficient_thrust_with_422() -> None:
    payload = copy.deepcopy(_valid_rocket_config_payload())
    # Mantém a geometria estável, mas reduz o empuxo bem abaixo do peso
    # (~75 N) na decolagem: ~3.4 N não tira o foguete do trilho.
    payload["propulsion"]["thermodynamic_impulse_parameters"]["exhaust_velocity_m_s"] = 5.0
    payload["propulsion"]["thermodynamic_impulse_parameters"]["pressure_impulse_ns"] = 0.1

    response = client.post("/simulate", json=payload)

    assert response.status_code == 422
    detail = response.json()["detail"]
    assert isinstance(detail, str)
    assert "empuxo" in detail.lower()


def test_simulate_rejects_malformed_payload_with_422_validation_errors() -> None:
    payload = copy.deepcopy(_valid_rocket_config_payload())
    del payload["propulsion"]

    response = client.post("/simulate", json=payload)

    assert response.status_code == 422
    # Erro de validação do Pydantic/FastAPI: `detail` é uma lista de erros,
    # ao contrário do `detail` (string) do handler de `SimulationError`.
    detail = response.json()["detail"]
    assert isinstance(detail, list)
    assert any(error["loc"] == ["body", "propulsion"] for error in detail)


def test_simulate_allows_cors_from_the_configured_frontend_origin() -> None:
    response = client.post(
        "/simulate",
        json=_valid_rocket_config_payload(),
        headers={"Origin": "http://localhost:3000"},
    )
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
