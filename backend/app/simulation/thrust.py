"""Modelo de empuxo/impulso do motor a partir dos parâmetros termodinâmicos."""

from dataclasses import dataclass

from app.schemas import RocketConfig
from app.simulation.mass import VariableMassModel


@dataclass(frozen=True)
class ThrustModel:
    """Empuxo do motor ao longo da queima do propelente.

    O empuxo total é a soma do empuxo de momento (decorrente da ejeção dos
    gases, `mdot * Ve`) com o empuxo de pressão (decorrente da diferença de
    pressão na saída do bocal, obtido a partir do impulso de pressão
    distribuído uniformemente ao longo da queima). Como a vazão mássica é
    constante durante toda a queima (ver `VariableMassModel`), o empuxo
    resultante também é constante nesse intervalo.
    """

    burn_time_s: float
    mass_flow_rate_kg_s: float
    exhaust_velocity_m_s: float
    pressure_impulse_ns: float
    total_impulse_ns: float

    @classmethod
    def from_rocket_config(
        cls, config: RocketConfig, mass_model: VariableMassModel | None = None
    ) -> "ThrustModel":
        mass_model = mass_model or VariableMassModel.from_rocket_config(config)
        thermo = config.propulsion.thermodynamic_impulse_parameters
        return cls(
            burn_time_s=mass_model.burn_time_s,
            mass_flow_rate_kg_s=mass_model.propellant_mass_flow_rate_kg_s,
            exhaust_velocity_m_s=thermo.exhaust_velocity_m_s,
            pressure_impulse_ns=thermo.pressure_impulse_ns,
            total_impulse_ns=thermo.total_impulse_ns,
        )

    @property
    def momentum_thrust_n(self) -> float:
        """Componente de empuxo devida à quantidade de movimento dos gases ejetados (N)."""
        return self.mass_flow_rate_kg_s * self.exhaust_velocity_m_s

    @property
    def pressure_thrust_n(self) -> float:
        """Componente de empuxo devida à diferença de pressão na saída do bocal (N)."""
        return self.pressure_impulse_ns / self.burn_time_s

    @property
    def average_thrust_n(self) -> float:
        """Empuxo total médio durante a queima (N)."""
        return self.momentum_thrust_n + self.pressure_thrust_n

    def thrust_at(self, t_s: float) -> float:
        """Empuxo instantâneo (N) no instante `t_s`.

        Constante durante a queima, zero antes do início ou após o burnout.
        """
        if 0.0 <= t_s < self.burn_time_s:
            return self.average_thrust_n
        return 0.0

    def impulse_up_to(self, t_s: float) -> float:
        """Impulso acumulado (N·s) desde o início da queima até o instante `t_s`."""
        elapsed_s = min(max(t_s, 0.0), self.burn_time_s)
        return self.average_thrust_n * elapsed_s
