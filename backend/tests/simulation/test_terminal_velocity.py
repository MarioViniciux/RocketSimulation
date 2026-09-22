"""Testes de `ParachuteTerminalVelocityModel`: velocidade na qual o arrasto
do paraquedas equilibra o peso do foguete (equilíbrio quase-estático)."""

import math

import pytest

from app.simulation.atmosphere import AtmosphereModel
from app.simulation.terminal_velocity import ParachuteTerminalVelocityModel, _terminal_velocity_m_s


def test_terminal_velocity_formula_matches_closed_form_equilibrium() -> None:
    # sqrt(2*m*g / (rho*Cd*A)) com números redondos: m=1kg, g=10, rho=1, Cd=1, A=1 -> sqrt(20)
    assert _terminal_velocity_m_s(
        mass_kg=1.0, gravity_m_s2=10.0, air_density_kg_m3=1.0, drag_coefficient=1.0, area_m2=1.0
    ) == pytest.approx(math.sqrt(20.0))


def _model() -> ParachuteTerminalVelocityModel:
    return ParachuteTerminalVelocityModel(
        atmosphere_model=AtmosphereModel(latitude_deg=0.0, elevation_m=0.0),
        has_drogue=True,
        drogue_drag_coefficient=1.2,
        drogue_diameter_m=1.0,
        main_drag_coefficient=1.5,
        main_diameter_m=3.0,
    )


def test_main_terminal_velocity_is_the_speed_at_which_drag_balances_weight() -> None:
    model = _model()
    mass_kg = 12.0
    altitude_agl_m = 500.0
    v_terminal = model.main_terminal_velocity_m_s(altitude_agl_m, mass_kg)

    gravity_m_s2 = model.atmosphere_model.gravity_m_s2(altitude_agl_m)
    air_density_kg_m3 = model.atmosphere_model.density_kg_m3(altitude_agl_m)
    area_m2 = math.pi * (model.main_diameter_m / 2.0) ** 2
    drag_at_terminal_velocity_n = (
        0.5 * model.main_drag_coefficient * air_density_kg_m3 * v_terminal**2 * area_m2
    )
    weight_n = mass_kg * gravity_m_s2

    assert drag_at_terminal_velocity_n == pytest.approx(weight_n, rel=1e-9)


def test_drogue_terminal_velocity_is_the_speed_at_which_drag_balances_weight() -> None:
    model = _model()
    assert model.drogue_drag_coefficient is not None
    assert model.drogue_diameter_m is not None
    mass_kg = 12.0
    altitude_agl_m = 500.0
    v_terminal = model.drogue_terminal_velocity_m_s(altitude_agl_m, mass_kg)

    gravity_m_s2 = model.atmosphere_model.gravity_m_s2(altitude_agl_m)
    air_density_kg_m3 = model.atmosphere_model.density_kg_m3(altitude_agl_m)
    area_m2 = math.pi * (model.drogue_diameter_m / 2.0) ** 2
    drag_at_terminal_velocity_n = (
        0.5 * model.drogue_drag_coefficient * air_density_kg_m3 * v_terminal**2 * area_m2
    )
    weight_n = mass_kg * gravity_m_s2

    assert drag_at_terminal_velocity_n == pytest.approx(weight_n, rel=1e-9)


def test_drogue_terminal_velocity_requires_drogue_configured() -> None:
    model = ParachuteTerminalVelocityModel(
        atmosphere_model=AtmosphereModel(latitude_deg=0.0, elevation_m=0.0),
        has_drogue=False,
        drogue_drag_coefficient=None,
        drogue_diameter_m=None,
        main_drag_coefficient=1.5,
        main_diameter_m=3.0,
    )
    with pytest.raises(ValueError):
        model.drogue_terminal_velocity_m_s(0.0, 10.0)
