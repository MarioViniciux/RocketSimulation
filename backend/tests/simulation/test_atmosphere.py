"""Testes de `AtmosphereModel` contra valores conhecidos da Atmosfera Padrão
Internacional (ISA) e das leis físicas que o modelo compõe (gases ideais,
Somigliana, inverso do quadrado da gravidade com a altitude).
"""

import math

import pytest

from app.simulation.atmosphere import (
    _EARTH_MEAN_RADIUS_M,
    _SPECIFIC_GAS_CONSTANT_AIR_J_KG_K,
    AtmosphereModel,
)

_SEA_LEVEL_TEMPERATURE_K = 288.15
_SEA_LEVEL_PRESSURE_PA = 101_325.0
_TROPOPAUSE_ALTITUDE_M = 11_000.0
_TROPOPAUSE_TEMPERATURE_K = 216.65
_TROPOPAUSE_PRESSURE_PA = 22_632.06
_EQUATORIAL_GRAVITY_M_S2 = 9.7803253359


def _equator_model() -> AtmosphereModel:
    return AtmosphereModel(latitude_deg=0.0, elevation_m=0.0)


def test_sea_level_matches_isa_standard_atmosphere() -> None:
    model = _equator_model()
    assert model.temperature_k(0.0) == pytest.approx(_SEA_LEVEL_TEMPERATURE_K)
    assert model.pressure_pa(0.0) == pytest.approx(_SEA_LEVEL_PRESSURE_PA)
    assert model.density_kg_m3(0.0) == pytest.approx(1.225, rel=1e-3)


def test_tropopause_boundary_matches_isa_standard_atmosphere() -> None:
    model = _equator_model()
    assert model.temperature_k(_TROPOPAUSE_ALTITUDE_M) == pytest.approx(_TROPOPAUSE_TEMPERATURE_K)
    assert model.pressure_pa(_TROPOPAUSE_ALTITUDE_M) == pytest.approx(
        _TROPOPAUSE_PRESSURE_PA, rel=1e-5
    )


def test_density_follows_ideal_gas_law_from_pressure_and_temperature() -> None:
    model = _equator_model()
    for altitude_agl_m in (0.0, 5000.0, 15000.0):
        expected_density = model.pressure_pa(altitude_agl_m) / (
            _SPECIFIC_GAS_CONSTANT_AIR_J_KG_K * model.temperature_k(altitude_agl_m)
        )
        assert model.density_kg_m3(altitude_agl_m) == pytest.approx(expected_density)


def test_speed_of_sound_matches_ideal_gas_formula() -> None:
    model = _equator_model()
    temperature_k = model.temperature_k(0.0)
    expected = math.sqrt(1.4 * _SPECIFIC_GAS_CONSTANT_AIR_J_KG_K * temperature_k)
    assert model.speed_of_sound_m_s(0.0) == pytest.approx(expected)


def test_gravity_at_equator_sea_level_matches_somigliana_constant() -> None:
    model = _equator_model()
    assert model.gravity_m_s2(0.0) == pytest.approx(_EQUATORIAL_GRAVITY_M_S2)


def test_gravity_follows_inverse_square_law_with_altitude() -> None:
    model = _equator_model()
    g0 = model.gravity_m_s2(0.0)
    g_at_one_earth_radius = model.gravity_m_s2(_EARTH_MEAN_RADIUS_M)
    # A uma altitude de um raio terrestre, a distância ao centro dobra:
    # g cai para 1/4 do valor ao nível do mar (lei do inverso do quadrado).
    assert g_at_one_earth_radius == pytest.approx(g0 / 4.0)


def test_elevation_shifts_the_reference_sea_level_altitude() -> None:
    elevated_model = AtmosphereModel(latitude_deg=0.0, elevation_m=1000.0)
    reference_model = _equator_model()
    assert elevated_model.temperature_k(0.0) == pytest.approx(reference_model.temperature_k(1000.0))
    assert elevated_model.pressure_pa(0.0) == pytest.approx(reference_model.pressure_pa(1000.0))
