"""Testes de `VariableMassModel`: queima linear de propelente com vazão constante."""

import pytest

from app.simulation.mass import VariableMassModel


def _model() -> VariableMassModel:
    return VariableMassModel(dry_mass_kg=5.0, propellant_mass_kg=2.0, burn_time_s=4.0)


def test_propellant_mass_flow_rate_is_propellant_mass_over_burn_time() -> None:
    assert _model().propellant_mass_flow_rate_kg_s == pytest.approx(0.5)


@pytest.mark.parametrize(
    "t_s, expected_propellant_mass_kg",
    [
        (-1.0, 2.0),
        (0.0, 2.0),
        (2.0, 1.0),
        (4.0, 0.0),
        (10.0, 0.0),
    ],
)
def test_propellant_mass_decreases_linearly_during_burn(
    t_s: float, expected_propellant_mass_kg: float
) -> None:
    assert _model().propellant_mass_at(t_s) == pytest.approx(expected_propellant_mass_kg)


def test_total_mass_is_dry_mass_plus_remaining_propellant() -> None:
    model = _model()
    assert model.total_mass_at(0.0) == pytest.approx(7.0)
    assert model.total_mass_at(2.0) == pytest.approx(6.0)
    assert model.total_mass_at(4.0) == pytest.approx(5.0)


@pytest.mark.parametrize(
    "t_s, expected_flow_rate_kg_s",
    [
        (-1.0, 0.0),
        (0.0, -0.5),
        (2.0, -0.5),
        (4.0, 0.0),
        (10.0, 0.0),
    ],
)
def test_mass_flow_rate_is_constant_during_burn_and_zero_outside(
    t_s: float, expected_flow_rate_kg_s: float
) -> None:
    assert _model().mass_flow_rate_at(t_s) == pytest.approx(expected_flow_rate_kg_s)
