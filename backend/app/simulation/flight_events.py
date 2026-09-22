"""Lógica de eventos de voo: burnout, apogeu, ativação de paraquedas e pouso.

Executa a integração de `TranslationalDynamicsModel` passo a passo e detecta
as transições discretas do voo. O instante exato de cada evento é refinado
por interpolação linear entre os dois passos de RK4 que o intercalam (raiz
de `vz(t) = 0` para o apogeu, de `z(t) = 0` para o pouso), suficiente para
uma primeira implementação com passo de integração pequeno.

A ativação do drogue e do main é agendada a partir do instante do apogeu,
somando `drogue_deployment_time_s`/`main_deployment_time_s` (ver
`app/recovery/schemas.py`). A partir de cada ativação, a integração passa a
usar o arrasto do paraquedas correspondente (coeficiente de arrasto e área
do paraquedas circular) no lugar do arrasto do corpo do foguete — ver
`app.simulation.terminal_velocity` para o cálculo analítico da velocidade
terminal sob cada paraquedas.
"""

import math
from dataclasses import dataclass
from enum import StrEnum

from app.schemas import RocketConfig
from app.simulation.drag import DragModel
from app.simulation.dynamics import FlightState, TranslationalDynamicsModel, Vector3


class FlightEventType(StrEnum):
    BURNOUT = "burnout"
    APOGEE = "apogee"
    DROGUE_DEPLOYMENT = "drogue_deployment"
    MAIN_DEPLOYMENT = "main_deployment"
    LANDING = "landing"


@dataclass(frozen=True)
class FlightEvent:
    """Ocorrência de um evento de voo, com o estado interpolado nesse instante."""

    event_type: FlightEventType
    state: FlightState


@dataclass(frozen=True)
class FlightTimeline:
    """Histórico completo (estados e eventos) de uma simulação de voo."""

    states: tuple[FlightState, ...]
    events: tuple[FlightEvent, ...]

    def event(self, event_type: FlightEventType) -> FlightEvent | None:
        """Primeiro evento do tipo informado, ou `None` se não ocorreu."""
        for occurred_event in self.events:
            if occurred_event.event_type == event_type:
                return occurred_event
        return None


def _lerp_vector3(a: Vector3, b: Vector3, fraction: float) -> Vector3:
    return (
        a[0] + fraction * (b[0] - a[0]),
        a[1] + fraction * (b[1] - a[1]),
        a[2] + fraction * (b[2] - a[2]),
    )


def _interpolate_state(state0: FlightState, state1: FlightState, t_s: float) -> FlightState:
    span_s = state1.t_s - state0.t_s
    fraction = 0.0 if span_s == 0.0 else (t_s - state0.t_s) / span_s
    return FlightState(
        t_s=t_s,
        position_m=_lerp_vector3(state0.position_m, state1.position_m, fraction),
        velocity_m_s=_lerp_vector3(state0.velocity_m_s, state1.velocity_m_s, fraction),
    )


def _linear_root_t_s(t0_s: float, f0: float, t1_s: float, f1: float) -> float:
    """Instante em que `f` cruza zero, por interpolação linear entre (t0, f0) e (t1, f1)."""
    if f1 == f0:
        return t0_s
    return t0_s + (0.0 - f0) * (t1_s - t0_s) / (f1 - f0)


def _canopy_drag_model(drag_coefficient: float, diameter_m: float) -> DragModel:
    canopy_area_m2 = math.pi * (diameter_m / 2.0) ** 2
    return DragModel(reference_area_m2=canopy_area_m2, subsonic_drag_coefficient=drag_coefficient)


@dataclass(frozen=True)
class FlightEventSimulator:
    """Simula o voo completo, detectando os eventos ao longo da integração."""

    dynamics_model: TranslationalDynamicsModel
    burn_time_s: float
    has_drogue: bool
    drogue_deployment_time_s: float | None
    main_deployment_time_s: float
    drogue_drag_model: DragModel | None
    main_drag_model: DragModel

    @classmethod
    def from_rocket_config(
        cls,
        config: RocketConfig,
        dynamics_model: TranslationalDynamicsModel | None = None,
    ) -> "FlightEventSimulator":
        dynamics_model = dynamics_model or TranslationalDynamicsModel.from_rocket_config(config)
        recovery = config.recovery
        drogue_drag_model = None
        if recovery.has_drogue:
            assert recovery.drogue_drag_coefficient is not None
            assert recovery.drogue_diameter_m is not None
            drogue_drag_model = _canopy_drag_model(
                recovery.drogue_drag_coefficient, recovery.drogue_diameter_m
            )
        return cls(
            dynamics_model=dynamics_model,
            burn_time_s=dynamics_model.mass_model.burn_time_s,
            has_drogue=recovery.has_drogue,
            drogue_deployment_time_s=recovery.drogue_deployment_time_s,
            main_deployment_time_s=recovery.main_deployment_time_s,
            drogue_drag_model=drogue_drag_model,
            main_drag_model=_canopy_drag_model(
                recovery.main_drag_coefficient, recovery.main_diameter_m
            ),
        )

    def simulate(self, dt_s: float, max_time_s: float) -> FlightTimeline:
        """Integra o voo até o pouso (ou até `max_time_s`), registrando os eventos."""
        states: list[FlightState] = [FlightState.at_launch()]
        events: list[FlightEvent] = []

        burnout_done = False
        apogee_done = False
        drogue_done = not self.has_drogue
        main_done = False
        drogue_deploy_time_s: float | None = None
        main_deploy_time_s: float | None = None
        active_drag_model = self.dynamics_model.drag_model

        state = states[0]
        while state.t_s < max_time_s:
            next_state = self.dynamics_model.step_rk4(state, dt_s, active_drag_model)

            if not burnout_done and state.t_s < self.burn_time_s <= next_state.t_s:
                burnout_state = _interpolate_state(state, next_state, self.burn_time_s)
                events.append(FlightEvent(FlightEventType.BURNOUT, burnout_state))
                burnout_done = True

            if not apogee_done and state.velocity_m_s[2] > 0.0 >= next_state.velocity_m_s[2]:
                apogee_time_s = _linear_root_t_s(
                    state.t_s, state.velocity_m_s[2], next_state.t_s, next_state.velocity_m_s[2]
                )
                apogee_state = _interpolate_state(state, next_state, apogee_time_s)
                events.append(FlightEvent(FlightEventType.APOGEE, apogee_state))
                apogee_done = True
                if self.has_drogue and self.drogue_deployment_time_s is not None:
                    drogue_deploy_time_s = apogee_time_s + self.drogue_deployment_time_s
                main_deploy_time_s = apogee_time_s + self.main_deployment_time_s

            if (
                not drogue_done
                and drogue_deploy_time_s is not None
                and state.t_s < drogue_deploy_time_s <= next_state.t_s
            ):
                drogue_state = _interpolate_state(state, next_state, drogue_deploy_time_s)
                events.append(FlightEvent(FlightEventType.DROGUE_DEPLOYMENT, drogue_state))
                drogue_done = True
                assert self.drogue_drag_model is not None
                active_drag_model = self.drogue_drag_model

            if (
                not main_done
                and main_deploy_time_s is not None
                and state.t_s < main_deploy_time_s <= next_state.t_s
            ):
                main_state = _interpolate_state(state, next_state, main_deploy_time_s)
                events.append(FlightEvent(FlightEventType.MAIN_DEPLOYMENT, main_state))
                main_done = True
                active_drag_model = self.main_drag_model

            if apogee_done and state.position_m[2] > 0.0 >= next_state.position_m[2]:
                landing_time_s = _linear_root_t_s(
                    state.t_s, state.position_m[2], next_state.t_s, next_state.position_m[2]
                )
                landing_state = _interpolate_state(state, next_state, landing_time_s)
                events.append(FlightEvent(FlightEventType.LANDING, landing_state))
                states.append(landing_state)
                return FlightTimeline(states=tuple(states), events=tuple(events))

            state = next_state
            states.append(state)

        return FlightTimeline(states=tuple(states), events=tuple(events))
