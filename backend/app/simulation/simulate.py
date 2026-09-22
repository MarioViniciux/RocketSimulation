"""Orquestração da simulação de voo completa a partir de um `RocketConfig`.

Executa o pipeline inteiro (massa variável, empuxo, atmosfera, arrasto,
integração das equações de movimento, eventos de voo, velocidade terminal
sob paraquedas e séries temporais) e monta o `SimulationResult` estruturado
consumido pelo endpoint `POST /simulate`.
"""

from app.schemas import RocketConfig
from app.simulation.exceptions import (
    IncompleteFlightError,
    InsufficientThrustError,
    UnstableRocketConfigurationError,
)
from app.simulation.flight_events import FlightEventSimulator, FlightEventType
from app.simulation.flight_series import build_flight_time_series
from app.simulation.mass import VariableMassModel
from app.simulation.schemas import FlightTimeSeriesOutput, SimulationResult
from app.simulation.stability import StaticStabilityModel
from app.simulation.terminal_velocity import ParachuteTerminalVelocityModel

_DEFAULT_TIME_STEP_S = 0.01
_DEFAULT_MAX_FLIGHT_TIME_S = 300.0


def _validate_liftoff_conditions(
    event_simulator: FlightEventSimulator, stability_model: StaticStabilityModel
) -> None:
    """Rejeita configurações que não conseguem sequer decolar de forma estável.

    Verificada antes de integrar o voo, para falhar rápido e com uma
    mensagem específica em vez de um erro genérico de simulação incompleta.
    """
    margin_calibers = stability_model.stability_margin_calibers_at(0.0)
    if margin_calibers <= 0.0:
        raise UnstableRocketConfigurationError(
            "Configuração aerodinamicamente instável no lançamento: margem de "
            f"estabilidade de {margin_calibers:.2f} cal (CP à frente ou sobre o CM). "
            "É necessário que o CP fique atrás do CM (margem positiva)."
        )

    dynamics_model = event_simulator.dynamics_model
    thrust_n = dynamics_model.thrust_model.average_thrust_n
    weight_n = dynamics_model.mass_model.total_mass_at(
        0.0
    ) * dynamics_model.atmosphere_model.gravity_m_s2(0.0)
    if thrust_n <= weight_n:
        raise InsufficientThrustError(
            f"Empuxo médio do motor ({thrust_n:.1f} N) não supera o peso do foguete "
            f"na decolagem ({weight_n:.1f} N): o foguete não decola do trilho."
        )


def run_simulation(
    config: RocketConfig,
    dt_s: float = _DEFAULT_TIME_STEP_S,
    max_time_s: float = _DEFAULT_MAX_FLIGHT_TIME_S,
) -> SimulationResult:
    """Executa a simulação completa de voo e monta o resultado estruturado.

    Levanta `SimulationError` (ver `app.simulation.exceptions`) para
    configurações fisicamente inválidas ou instáveis: foguete instável no
    lançamento, empuxo insuficiente para decolar, ou voo que não completa os
    eventos esperados dentro do tempo máximo de simulação.
    """
    event_simulator = FlightEventSimulator.from_rocket_config(config)
    stability_model = StaticStabilityModel.from_rocket_config(config)
    _validate_liftoff_conditions(event_simulator, stability_model)

    timeline = event_simulator.simulate(dt_s, max_time_s)

    apogee_event = timeline.event(FlightEventType.APOGEE)
    if apogee_event is None:
        raise IncompleteFlightError(
            "A simulação não atingiu o apogeu dentro do tempo máximo configurado."
        )

    main_event = timeline.event(FlightEventType.MAIN_DEPLOYMENT)
    if main_event is None:
        raise IncompleteFlightError(
            "A simulação não atingiu a ativação do main dentro do tempo máximo configurado."
        )

    mass_model = VariableMassModel.from_rocket_config(config)
    terminal_velocity_model = ParachuteTerminalVelocityModel.from_rocket_config(config)

    drogue_terminal_velocity_m_s = None
    drogue_event = timeline.event(FlightEventType.DROGUE_DEPLOYMENT)
    if drogue_event is not None:
        drogue_terminal_velocity_m_s = terminal_velocity_model.drogue_terminal_velocity_m_s(
            drogue_event.state.position_m[2], mass_model.total_mass_at(drogue_event.state.t_s)
        )

    main_terminal_velocity_m_s = terminal_velocity_model.main_terminal_velocity_m_s(
        main_event.state.position_m[2], mass_model.total_mass_at(main_event.state.t_s)
    )

    time_series = build_flight_time_series(timeline, event_simulator)

    return SimulationResult(
        apogee_altitude_m=apogee_event.state.position_m[2],
        stability_margin_calibers=stability_model.stability_margin_calibers_at(0.0),
        burn_time_s=event_simulator.burn_time_s,
        drogue_terminal_velocity_m_s=drogue_terminal_velocity_m_s,
        main_terminal_velocity_m_s=main_terminal_velocity_m_s,
        time_series=FlightTimeSeriesOutput(
            times_s=time_series.times_s,
            altitudes_m=time_series.altitudes_m,
            vertical_velocities_m_s=time_series.vertical_velocities_m_s,
            vertical_accelerations_m_s2=time_series.vertical_accelerations_m_s2,
        ),
    )
