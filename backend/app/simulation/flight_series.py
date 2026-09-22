"""Vetores temporais de saída: altitude h(t), velocidade e aceleração verticais.

Constrói as séries temporais a partir de um `FlightTimeline` já simulado
(ver `app.simulation.flight_events`). A altitude e a velocidade vertical
vêm diretamente dos estados integrados; a aceleração vertical é recalculada
em cada instante com `TranslationalDynamicsModel.acceleration_m_s2`, usando
o modelo de arrasto que estava ativo naquele ponto do voo (corpo do
foguete, drogue ou main — de acordo com os eventos de ativação já
detectados).
"""

from dataclasses import dataclass

from app.simulation.drag import DragModel
from app.simulation.flight_events import FlightEventSimulator, FlightEventType, FlightTimeline


@dataclass(frozen=True)
class FlightSample:
    """Amostra das séries de saída em um instante de voo."""

    t_s: float
    altitude_m: float
    vertical_velocity_m_s: float
    vertical_acceleration_m_s2: float


@dataclass(frozen=True)
class FlightTimeSeries:
    """Vetores temporais h(t), vz(t) e az(t) de uma simulação completa de voo."""

    samples: tuple[FlightSample, ...]

    @property
    def times_s(self) -> tuple[float, ...]:
        return tuple(sample.t_s for sample in self.samples)

    @property
    def altitudes_m(self) -> tuple[float, ...]:
        """Vetor h(t) (m)."""
        return tuple(sample.altitude_m for sample in self.samples)

    @property
    def vertical_velocities_m_s(self) -> tuple[float, ...]:
        """Vetor vz(t) (m/s)."""
        return tuple(sample.vertical_velocity_m_s for sample in self.samples)

    @property
    def vertical_accelerations_m_s2(self) -> tuple[float, ...]:
        """Vetor az(t) (m/s²)."""
        return tuple(sample.vertical_acceleration_m_s2 for sample in self.samples)


def _drag_model_at(
    t_s: float, simulator: FlightEventSimulator, timeline: FlightTimeline
) -> DragModel:
    """Modelo de arrasto vigente no instante `t_s`, conforme os eventos de ativação."""
    main_event = timeline.event(FlightEventType.MAIN_DEPLOYMENT)
    if main_event is not None and t_s >= main_event.state.t_s:
        return simulator.main_drag_model

    drogue_event = timeline.event(FlightEventType.DROGUE_DEPLOYMENT)
    if drogue_event is not None and t_s >= drogue_event.state.t_s:
        assert simulator.drogue_drag_model is not None
        return simulator.drogue_drag_model

    return simulator.dynamics_model.drag_model


def build_flight_time_series(
    timeline: FlightTimeline, simulator: FlightEventSimulator
) -> FlightTimeSeries:
    """Constrói h(t), vz(t) e az(t) a partir de um `FlightTimeline` já simulado."""
    samples = []
    for state in timeline.states:
        drag_model = _drag_model_at(state.t_s, simulator, timeline)
        acceleration_m_s2 = simulator.dynamics_model.acceleration_m_s2(
            state.t_s, state.position_m, state.velocity_m_s, drag_model
        )
        samples.append(
            FlightSample(
                t_s=state.t_s,
                altitude_m=state.position_m[2],
                vertical_velocity_m_s=state.velocity_m_s[2],
                vertical_acceleration_m_s2=acceleration_m_s2[2],
            )
        )
    return FlightTimeSeries(samples=tuple(samples))
