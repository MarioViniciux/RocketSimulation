"""Testes de `FlightEventSimulator`: detecção de eventos de voo (burnout,
apogeu, ativação de paraquedas, pouso) comparada com a solução analítica de
cinemática de aceleração constante por fase (queima e voo livre balístico).
"""

import pytest
from helpers import EQUATOR_SEA_LEVEL_ATMOSPHERE, constant_thrust_dynamics_model

from app.simulation.drag import DragModel
from app.simulation.flight_events import FlightEventSimulator, FlightEventType

_THRUST_N = 150.0
_DRY_MASS_KG = 10.0
_BURN_TIME_S = 3.0
_DROGUE_DEPLOYMENT_OFFSET_S = 0.5
_MAIN_DEPLOYMENT_OFFSET_S = 2.0


def _analytic_burnout_velocity_and_altitude() -> tuple[float, float]:
    g0 = EQUATOR_SEA_LEVEL_ATMOSPHERE.gravity_m_s2(0.0)
    acceleration = _THRUST_N / _DRY_MASS_KG - g0
    velocity = acceleration * _BURN_TIME_S
    altitude = 0.5 * acceleration * _BURN_TIME_S**2
    return velocity, altitude


def _analytic_apogee_time_and_altitude() -> tuple[float, float]:
    g0 = EQUATOR_SEA_LEVEL_ATMOSPHERE.gravity_m_s2(0.0)
    burnout_velocity, burnout_altitude = _analytic_burnout_velocity_and_altitude()
    time_s = _BURN_TIME_S + burnout_velocity / g0
    altitude_m = burnout_altitude + burnout_velocity**2 / (2.0 * g0)
    return time_s, altitude_m


def _build_simulator_with_drogue() -> FlightEventSimulator:
    dynamics_model = constant_thrust_dynamics_model(
        thrust_n=_THRUST_N, burn_time_s=_BURN_TIME_S, dry_mass_kg=_DRY_MASS_KG
    )
    return FlightEventSimulator(
        dynamics_model=dynamics_model,
        burn_time_s=_BURN_TIME_S,
        has_drogue=True,
        drogue_deployment_time_s=_DROGUE_DEPLOYMENT_OFFSET_S,
        main_deployment_time_s=_MAIN_DEPLOYMENT_OFFSET_S,
        drogue_drag_model=DragModel(reference_area_m2=0.785, subsonic_drag_coefficient=1.0),
        main_drag_model=DragModel(reference_area_m2=1.767, subsonic_drag_coefficient=1.5),
    )


def test_burnout_event_occurs_exactly_at_burn_time() -> None:
    timeline = _build_simulator_with_drogue().simulate(dt_s=0.001, max_time_s=20.0)
    burnout = timeline.event(FlightEventType.BURNOUT)
    assert burnout is not None
    assert burnout.state.t_s == pytest.approx(_BURN_TIME_S, abs=1e-9)


def test_apogee_matches_ballistic_coast_from_burnout() -> None:
    timeline = _build_simulator_with_drogue().simulate(dt_s=0.001, max_time_s=20.0)
    apogee = timeline.event(FlightEventType.APOGEE)
    assert apogee is not None

    expected_apogee_time_s, expected_apogee_altitude_m = _analytic_apogee_time_and_altitude()

    assert apogee.state.t_s == pytest.approx(expected_apogee_time_s, abs=1e-3)
    assert apogee.state.position_m[2] == pytest.approx(expected_apogee_altitude_m, abs=1e-2)
    assert apogee.state.velocity_m_s[2] == pytest.approx(0.0, abs=1e-2)


def test_parachute_deployment_events_are_scheduled_from_apogee() -> None:
    timeline = _build_simulator_with_drogue().simulate(dt_s=0.001, max_time_s=20.0)
    apogee = timeline.event(FlightEventType.APOGEE)
    drogue = timeline.event(FlightEventType.DROGUE_DEPLOYMENT)
    main = timeline.event(FlightEventType.MAIN_DEPLOYMENT)
    assert apogee is not None
    assert drogue is not None
    assert main is not None

    assert drogue.state.t_s == pytest.approx(apogee.state.t_s + _DROGUE_DEPLOYMENT_OFFSET_S)
    assert main.state.t_s == pytest.approx(apogee.state.t_s + _MAIN_DEPLOYMENT_OFFSET_S)


def test_events_occur_in_expected_order_and_flight_lands() -> None:
    dynamics_model = constant_thrust_dynamics_model(
        thrust_n=_THRUST_N, burn_time_s=_BURN_TIME_S, dry_mass_kg=_DRY_MASS_KG
    )
    # Sem drogue, e main ativado imediatamente no apogeu: evita depender da
    # cinemática não linear da descida sob paraquedas para prever quando o
    # main dispara, mantendo o teste focado na ordem dos eventos e no pouso.
    simulator = FlightEventSimulator(
        dynamics_model=dynamics_model,
        burn_time_s=_BURN_TIME_S,
        has_drogue=False,
        drogue_deployment_time_s=None,
        main_deployment_time_s=0.0,
        drogue_drag_model=None,
        main_drag_model=DragModel(reference_area_m2=1.767, subsonic_drag_coefficient=1.5),
    )

    timeline = simulator.simulate(dt_s=0.001, max_time_s=60.0)

    event_types = [event.event_type for event in timeline.events]
    assert event_types == [
        FlightEventType.BURNOUT,
        FlightEventType.APOGEE,
        FlightEventType.MAIN_DEPLOYMENT,
        FlightEventType.LANDING,
    ]

    landing = timeline.event(FlightEventType.LANDING)
    assert landing is not None
    assert landing.state.position_m[2] == pytest.approx(0.0, abs=1e-6)
