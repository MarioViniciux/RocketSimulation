"""Modelo de massa variável do foguete ao longo da queima do propelente."""

from dataclasses import dataclass

from app.schemas import RocketConfig


@dataclass(frozen=True)
class VariableMassModel:
    """Massa total do foguete como função do tempo de voo.

    Os grãos não queimam simultaneamente: a queima é progressiva, iniciando
    em uma extremidade do grão e avançando até a outra, grão a grão. Como
    todos os grãos têm a mesma massa (`propellant_mass_kg / grain_count`) e
    o mesmo tempo de queima (`single_grain_burn_time_s`), a vazão mássica
    total é constante ao longo de toda a queima, cuja duração total é
    `burn_time_s = grain_count * single_grain_burn_time_s`. A massa de
    propelente decresce linearmente de `propellant_mass_kg` até zero nesse
    intervalo.
    """

    dry_mass_kg: float
    propellant_mass_kg: float
    burn_time_s: float

    @classmethod
    def from_rocket_config(cls, config: RocketConfig) -> "VariableMassModel":
        propulsion = config.propulsion
        recovery = config.recovery
        dry_mass_kg = (
            config.structure.empty_mass_kg
            + config.avionics.mass_kg
            + config.payload.mass_kg
            + recovery.lower_support_mass_kg
            + recovery.parachutes_mass_kg
            + recovery.piston_cap_mass_kg
            + recovery.ejection_charge_mass_kg
            + propulsion.combustion_chamber.empty_mass_kg
        )
        grain = propulsion.propellant_grain
        return cls(
            dry_mass_kg=dry_mass_kg,
            propellant_mass_kg=grain.propellant_mass_kg,
            burn_time_s=grain.grain_count * grain.single_grain_burn_time_s,
        )

    @property
    def propellant_mass_flow_rate_kg_s(self) -> float:
        """Vazão mássica (magnitude, kg/s) durante a queima."""
        return self.propellant_mass_kg / self.burn_time_s

    def propellant_mass_at(self, t_s: float) -> float:
        """Massa de propelente restante no instante `t_s` (kg)."""
        if t_s <= 0.0:
            return self.propellant_mass_kg
        if t_s >= self.burn_time_s:
            return 0.0
        return self.propellant_mass_kg * (1.0 - t_s / self.burn_time_s)

    def total_mass_at(self, t_s: float) -> float:
        """Massa total do foguete (estrutura seca + propelente restante) no instante `t_s` (kg)."""
        return self.dry_mass_kg + self.propellant_mass_at(t_s)

    def mass_flow_rate_at(self, t_s: float) -> float:
        """Taxa de variação da massa, dm/dt (kg/s), no instante `t_s`.

        Negativa durante a queima, zero antes do início ou após o burnout.
        """
        if 0.0 <= t_s < self.burn_time_s:
            return -self.propellant_mass_flow_rate_kg_s
        return 0.0
