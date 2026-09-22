"""Testes de `ThrustModel`: empuxo constante durante a queima (momento + pressão)."""

import pytest

from app.simulation.thrust import ThrustModel


def _model() -> ThrustModel:
    return ThrustModel(
        burn_time_s=4.0,
        mass_flow_rate_kg_s=0.5,
        exhaust_velocity_m_s=1000.0,
        pressure_impulse_ns=400.0,
        total_impulse_ns=2800.0,
    )


def test_momentum_thrust_is_mass_flow_rate_times_exhaust_velocity() -> None:
    assert _model().momentum_thrust_n == pytest.approx(500.0)


def test_pressure_thrust_is_pressure_impulse_over_burn_time() -> None:
    assert _model().pressure_thrust_n == pytest.approx(100.0)


def test_average_thrust_is_sum_of_momentum_and_pressure_thrust() -> None:
    assert _model().average_thrust_n == pytest.approx(600.0)


@pytest.mark.parametrize(
    "t_s, expected_thrust_n",
    [
        (-1.0, 0.0),
        (0.0, 600.0),
        (2.0, 600.0),
        (4.0, 0.0),
        (10.0, 0.0),
    ],
)
def test_thrust_is_constant_during_burn_and_zero_outside(
    t_s: float, expected_thrust_n: float
) -> None:
    assert _model().thrust_at(t_s) == pytest.approx(expected_thrust_n)


@pytest.mark.parametrize(
    "t_s, expected_impulse_ns",
    [
        (-1.0, 0.0),
        (0.0, 0.0),
        (2.0, 1200.0),
        (4.0, 2400.0),
        (10.0, 2400.0),
    ],
)
def test_impulse_up_to_is_average_thrust_times_elapsed_burn_time(
    t_s: float, expected_impulse_ns: float
) -> None:
    assert _model().impulse_up_to(t_s) == pytest.approx(expected_impulse_ns)
