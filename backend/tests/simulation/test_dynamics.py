"""Testes do integrador 3-DoF (`TranslationalDynamicsModel`) com casos de
aceleração constante — solução analítica fechada em cinemática simples
(`v = a*t`, `x = 1/2 * a * t^2`) — cobrindo queda livre, empuxo constante em
trilho vertical e a projeção de forças perpendiculares ao trilho inclinado.
"""

import math

import pytest
from helpers import EQUATOR_SEA_LEVEL_ATMOSPHERE, constant_thrust_dynamics_model

from app.simulation.dynamics import FlightState


def test_acceleration_in_free_flight_at_rest_is_pure_gravity() -> None:
    model = constant_thrust_dynamics_model(thrust_n=0.0, burn_time_s=1.0, dry_mass_kg=10.0)
    acceleration = model.acceleration_m_s2(0.0, (0.0, 0.0, 0.0), (0.0, 0.0, 0.0))
    expected_g = EQUATOR_SEA_LEVEL_ATMOSPHERE.gravity_m_s2(0.0)
    assert acceleration == pytest.approx((0.0, 0.0, -expected_g))


def test_acceleration_on_inclined_rail_projects_out_perpendicular_gravity() -> None:
    angle_deg = 30.0
    thrust_n = 500.0
    dry_mass_kg = 10.0
    model = constant_thrust_dynamics_model(
        thrust_n=thrust_n,
        burn_time_s=5.0,
        dry_mass_kg=dry_mass_kg,
        launch_rail_length_m=100.0,
        launch_rail_angle_deg=angle_deg,
    )
    acceleration = model.acceleration_m_s2(0.0, (0.0, 0.0, 0.0), (0.0, 0.0, 0.0))

    # Em trilho, apenas a componente das forças paralela ao trilho atua: o
    # empuxo (já alinhado ao trilho) soma-se somente à projeção do peso
    # (vertical) sobre a direção do trilho, `-m*g*cos(theta)`.
    angle_rad = math.radians(angle_deg)
    rail_direction = (math.sin(angle_rad), 0.0, math.cos(angle_rad))
    g0 = EQUATOR_SEA_LEVEL_ATMOSPHERE.gravity_m_s2(0.0)
    expected_magnitude = thrust_n / dry_mass_kg - g0 * math.cos(angle_rad)

    assert acceleration == pytest.approx(
        tuple(component * expected_magnitude for component in rail_direction)
    )


def test_integrate_free_fall_matches_analytic_kinematics() -> None:
    model = constant_thrust_dynamics_model(thrust_n=0.0, burn_time_s=1.0, dry_mass_kg=10.0)
    dt_s = 0.001
    num_steps = 1000
    states = model.integrate(FlightState.at_launch(), dt_s, num_steps)
    final_state = states[-1]

    g0 = EQUATOR_SEA_LEVEL_ATMOSPHERE.gravity_m_s2(0.0)
    duration_s = dt_s * num_steps
    expected_velocity_z = -g0 * duration_s
    expected_position_z = -0.5 * g0 * duration_s**2

    assert final_state.velocity_m_s[2] == pytest.approx(expected_velocity_z, rel=1e-4)
    assert final_state.position_m[2] == pytest.approx(expected_position_z, rel=1e-4)
    assert final_state.velocity_m_s[0] == pytest.approx(0.0, abs=1e-9)
    assert final_state.position_m[0] == pytest.approx(0.0, abs=1e-9)


def test_integrate_constant_thrust_on_vertical_rail_matches_analytic_kinematics() -> None:
    thrust_n = 200.0
    dry_mass_kg = 10.0
    model = constant_thrust_dynamics_model(
        thrust_n=thrust_n,
        burn_time_s=5.0,
        dry_mass_kg=dry_mass_kg,
        launch_rail_length_m=1000.0,
        launch_rail_angle_deg=0.0,
    )
    dt_s = 0.001
    num_steps = 2000
    states = model.integrate(FlightState.at_launch(), dt_s, num_steps)
    final_state = states[-1]

    g0 = EQUATOR_SEA_LEVEL_ATMOSPHERE.gravity_m_s2(0.0)
    duration_s = dt_s * num_steps
    expected_acceleration = thrust_n / dry_mass_kg - g0
    expected_velocity_z = expected_acceleration * duration_s
    expected_position_z = 0.5 * expected_acceleration * duration_s**2

    assert final_state.velocity_m_s[2] == pytest.approx(expected_velocity_z, rel=1e-4)
    assert final_state.position_m[2] == pytest.approx(expected_position_z, rel=1e-4)
