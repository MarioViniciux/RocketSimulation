"""Fábricas de modelos de física para os testes do motor de simulação.

Constroem os modelos de dinâmica diretamente (sem passar por `RocketConfig`/
Pydantic), com parâmetros escolhidos para reproduzir casos de aceleração
constante por fase de voo — que têm solução analítica fechada em cinemática
simples (`v = a*t`, `x = 1/2 * a * t^2`) para comparação nos testes.
"""

from app.simulation.atmosphere import AtmosphereModel
from app.simulation.drag import DragModel
from app.simulation.dynamics import TranslationalDynamicsModel
from app.simulation.mass import VariableMassModel
from app.simulation.thrust import ThrustModel

EQUATOR_SEA_LEVEL_ATMOSPHERE = AtmosphereModel(latitude_deg=0.0, elevation_m=0.0)


def constant_thrust_dynamics_model(
    *,
    thrust_n: float,
    burn_time_s: float,
    dry_mass_kg: float,
    launch_rail_length_m: float = 0.0,
    launch_rail_angle_deg: float = 0.0,
    drag_coefficient: float = 0.0,
) -> TranslationalDynamicsModel:
    """Modelo de dinâmica com empuxo constante e massa constante (sem queima).

    `propellant_mass_kg=0` mantém a massa fixa durante o voo, de modo que o
    empuxo (constante enquanto `t_s < burn_time_s`) produz aceleração
    constante em cada fase — o caso analiticamente mais simples possível
    para validar o integrador RK4.
    """
    mass_model = VariableMassModel(
        dry_mass_kg=dry_mass_kg, propellant_mass_kg=0.0, burn_time_s=burn_time_s
    )
    thrust_model = ThrustModel(
        burn_time_s=burn_time_s,
        mass_flow_rate_kg_s=1.0,
        exhaust_velocity_m_s=thrust_n,
        pressure_impulse_ns=0.0,
        total_impulse_ns=thrust_n * burn_time_s,
    )
    drag_model = DragModel(reference_area_m2=0.01, subsonic_drag_coefficient=drag_coefficient)
    return TranslationalDynamicsModel(
        mass_model=mass_model,
        thrust_model=thrust_model,
        atmosphere_model=EQUATOR_SEA_LEVEL_ATMOSPHERE,
        drag_model=drag_model,
        launch_rail_length_m=launch_rail_length_m,
        launch_rail_angle_deg=launch_rail_angle_deg,
        wind_speed_m_s=0.0,
    )
