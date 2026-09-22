"""Integrador das equações de movimento do foguete (3-DoF, translacional).

3-DoF aqui significa três graus de liberdade translacionais (posição em X,
Y, Z), tratando o foguete como um ponto-massa — sem dinâmica rotacional de
atitude, que fica para uma extensão 6-DoF futura. Como não há modelo de
atitude, a orientação do foguete (necessária para a direção do empuxo) é
aproximada em duas fases:

1. Fase de trilho: enquanto o deslocamento ao longo do trilho é menor que
   `launch_rail_length_m`, o foguete é mecanicamente restrito ao eixo do
   trilho, cuja direção é dada por `launch_rail_angle_deg` (inclinação em
   relação à vertical). Apenas a componente das forças paralela ao trilho
   é considerada nessa fase — a componente perpendicular é cancelada pela
   reação normal do trilho, como em um lançador real.
2. Voo livre: assume-se ângulo de ataque nulo (foguete estaticamente
   estável "cata-vento", alinhado com a velocidade relativa ao ar).

O arrasto sempre se opõe à velocidade relativa ao vento, independente da
fase. O vento é modelado como um vetor horizontal constante ao longo do
eixo X (sem variação com a altitude) — `Environment` só informa a
intensidade do vento, não uma direção, então essa é a convenção adotada.

Este módulo apenas integra as equações de movimento passo a passo; a
lógica de eventos de voo (burnout, apogeu, acionamento de paraquedas,
pouso) está em `app.simulation.flight_events`.
"""

import math
from dataclasses import dataclass

from app.schemas import RocketConfig
from app.simulation.atmosphere import AtmosphereModel
from app.simulation.drag import DragModel
from app.simulation.mass import VariableMassModel
from app.simulation.thrust import ThrustModel

Vector3 = tuple[float, float, float]


def _add(a: Vector3, b: Vector3) -> Vector3:
    return (a[0] + b[0], a[1] + b[1], a[2] + b[2])


def _sub(a: Vector3, b: Vector3) -> Vector3:
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def _scale(a: Vector3, factor: float) -> Vector3:
    return (a[0] * factor, a[1] * factor, a[2] * factor)


def _norm(a: Vector3) -> float:
    return math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2)


def _unit(a: Vector3) -> Vector3:
    magnitude = _norm(a)
    if magnitude == 0.0:
        return (0.0, 0.0, 0.0)
    return _scale(a, 1.0 / magnitude)


def _dot(a: Vector3, b: Vector3) -> float:
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


@dataclass(frozen=True)
class FlightState:
    """Estado translacional do foguete em um instante de voo.

    `position_m` e `velocity_m_s` são vetores (X, Y, Z), com Z como altitude
    acima do solo (AGL) e X, Y no plano horizontal.
    """

    t_s: float
    position_m: Vector3
    velocity_m_s: Vector3

    @classmethod
    def at_launch(cls) -> "FlightState":
        """Estado inicial no instante do lançamento (repouso, na origem)."""
        return cls(t_s=0.0, position_m=(0.0, 0.0, 0.0), velocity_m_s=(0.0, 0.0, 0.0))


@dataclass(frozen=True)
class TranslationalDynamicsModel:
    """Modelo 3-DoF das forças e da integração numérica do movimento do foguete."""

    mass_model: VariableMassModel
    thrust_model: ThrustModel
    atmosphere_model: AtmosphereModel
    drag_model: DragModel
    launch_rail_length_m: float
    launch_rail_angle_deg: float
    wind_speed_m_s: float

    @classmethod
    def from_rocket_config(cls, config: RocketConfig) -> "TranslationalDynamicsModel":
        mass_model = VariableMassModel.from_rocket_config(config)
        environment = config.environment
        return cls(
            mass_model=mass_model,
            thrust_model=ThrustModel.from_rocket_config(config, mass_model),
            atmosphere_model=AtmosphereModel.from_rocket_config(config),
            drag_model=DragModel.from_rocket_config(config),
            launch_rail_length_m=environment.launch_rail_length_m,
            launch_rail_angle_deg=environment.launch_rail_angle_deg,
            wind_speed_m_s=environment.wind_speed_m_s,
        )

    def _wind_velocity_m_s(self) -> Vector3:
        return (self.wind_speed_m_s, 0.0, 0.0)

    def _rail_direction(self) -> Vector3:
        """Vetor unitário ao longo do trilho de lançamento.

        `launch_rail_angle_deg` é medido a partir da vertical (0° = trilho
        vertical); um ângulo positivo inclina o trilho no sentido +X.
        """
        angle_rad = math.radians(self.launch_rail_angle_deg)
        return (math.sin(angle_rad), 0.0, math.cos(angle_rad))

    def acceleration_m_s2(
        self,
        t_s: float,
        position_m: Vector3,
        velocity_m_s: Vector3,
        drag_model: DragModel | None = None,
    ) -> Vector3:
        """Aceleração (m/s²) resultante de empuxo, arrasto e peso no instante `t_s`.

        `drag_model` permite substituir o arrasto do corpo do foguete (usado
        por padrão) pelo arrasto de um paraquedas já ativado — ver
        `app.simulation.flight_events`.
        """
        drag_model = drag_model or self.drag_model
        mass_kg = self.mass_model.total_mass_at(t_s)
        altitude_agl_m = position_m[2]

        rail_direction = self._rail_direction()
        along_rail_distance_m = _dot(position_m, rail_direction)
        on_launch_rail = along_rail_distance_m < self.launch_rail_length_m

        relative_velocity_m_s = _sub(velocity_m_s, self._wind_velocity_m_s())
        relative_speed_m_s = _norm(relative_velocity_m_s)
        relative_velocity_unit = _unit(relative_velocity_m_s)

        if on_launch_rail or relative_speed_m_s == 0.0:
            thrust_direction = rail_direction
        else:
            thrust_direction = relative_velocity_unit
        thrust_force_n = _scale(thrust_direction, self.thrust_model.thrust_at(t_s))

        air_density_kg_m3 = self.atmosphere_model.density_kg_m3(altitude_agl_m)
        speed_of_sound_m_s = self.atmosphere_model.speed_of_sound_m_s(altitude_agl_m)
        drag_magnitude_n = drag_model.drag_force_n(
            relative_speed_m_s, air_density_kg_m3, speed_of_sound_m_s
        )
        drag_force_n = _scale(relative_velocity_unit, drag_magnitude_n)

        gravity_m_s2 = self.atmosphere_model.gravity_m_s2(altitude_agl_m)
        weight_force_n: Vector3 = (0.0, 0.0, -mass_kg * gravity_m_s2)

        total_force_n = _add(_add(thrust_force_n, drag_force_n), weight_force_n)
        if on_launch_rail:
            along_rail_force_n = _dot(total_force_n, rail_direction)
            total_force_n = _scale(rail_direction, along_rail_force_n)
        return _scale(total_force_n, 1.0 / mass_kg)

    def _derivative(
        self,
        t_s: float,
        position_m: Vector3,
        velocity_m_s: Vector3,
        drag_model: DragModel | None = None,
    ) -> tuple[Vector3, Vector3]:
        return velocity_m_s, self.acceleration_m_s2(t_s, position_m, velocity_m_s, drag_model)

    def step_rk4(
        self, state: FlightState, dt_s: float, drag_model: DragModel | None = None
    ) -> FlightState:
        """Avança o estado em `dt_s` segundos, via Runge-Kutta de 4ª ordem."""
        t0_s, p0_m, v0_m_s = state.t_s, state.position_m, state.velocity_m_s
        half_dt_s = dt_s / 2.0

        k1_v, k1_a = self._derivative(t0_s, p0_m, v0_m_s, drag_model)
        k2_v, k2_a = self._derivative(
            t0_s + half_dt_s,
            _add(p0_m, _scale(k1_v, half_dt_s)),
            _add(v0_m_s, _scale(k1_a, half_dt_s)),
            drag_model,
        )
        k3_v, k3_a = self._derivative(
            t0_s + half_dt_s,
            _add(p0_m, _scale(k2_v, half_dt_s)),
            _add(v0_m_s, _scale(k2_a, half_dt_s)),
            drag_model,
        )
        k4_v, k4_a = self._derivative(
            t0_s + dt_s,
            _add(p0_m, _scale(k3_v, dt_s)),
            _add(v0_m_s, _scale(k3_a, dt_s)),
            drag_model,
        )

        position_m = _add(
            p0_m,
            _scale(
                _add(_add(k1_v, _scale(k2_v, 2.0)), _add(_scale(k3_v, 2.0), k4_v)), dt_s / 6.0
            ),
        )
        velocity_m_s = _add(
            v0_m_s,
            _scale(
                _add(_add(k1_a, _scale(k2_a, 2.0)), _add(_scale(k3_a, 2.0), k4_a)), dt_s / 6.0
            ),
        )
        return FlightState(t_s=t0_s + dt_s, position_m=position_m, velocity_m_s=velocity_m_s)

    def integrate(
        self,
        initial_state: FlightState,
        dt_s: float,
        num_steps: int,
        drag_model: DragModel | None = None,
    ) -> list[FlightState]:
        """Integra `num_steps` passos de tamanho `dt_s`, a partir de `initial_state`."""
        states = [initial_state]
        state = initial_state
        for _ in range(num_steps):
            state = self.step_rk4(state, dt_s, drag_model)
            states.append(state)
        return states
