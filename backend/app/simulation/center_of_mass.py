"""Centro de Massa (CM) do foguete ao longo do voo."""

from dataclasses import dataclass

from app.schemas import RocketConfig
from app.simulation.mass import VariableMassModel

_DRY_MASS_TOLERANCE_KG = 1e-6


@dataclass(frozen=True)
class PointMass:
    """Massa pontual posicionada ao longo do eixo longitudinal do foguete.

    `position_m` é medida a partir de uma origem comum (ex.: a ponta do
    nariz), no mesmo referencial usado pelo `position_x_m` dos módulos de
    Aviônica e Payload.
    """

    mass_kg: float
    position_m: float


@dataclass(frozen=True)
class CenterOfMassModel:
    """Posição do CM do foguete em função do tempo de voo.

    Combina as massas fixas (estrutura, aviônica, payload, recuperação e a
    parte seca do motor) com a massa de propelente, que decresce ao longo da
    queima segundo `VariableMassModel`. Neste modelo simplificado, assume-se
    que o propelente permanece concentrado em uma posição fixa (a do CM seco
    do motor) enquanto queima — a migração do centroide do propelente ao
    longo dos grãos não é modelada.
    """

    mass_model: VariableMassModel
    fixed_point_masses: tuple[PointMass, ...]
    propellant_position_m: float

    def __post_init__(self) -> None:
        fixed_mass_kg = sum(pm.mass_kg for pm in self.fixed_point_masses)
        if abs(fixed_mass_kg - self.mass_model.dry_mass_kg) > _DRY_MASS_TOLERANCE_KG:
            raise ValueError(
                "Soma das massas fixas "
                f"({fixed_mass_kg} kg) não corresponde à massa seca do "
                f"VariableMassModel ({self.mass_model.dry_mass_kg} kg)."
            )

    @classmethod
    def from_rocket_config(
        cls, config: RocketConfig, mass_model: VariableMassModel | None = None
    ) -> "CenterOfMassModel":
        mass_model = mass_model or VariableMassModel.from_rocket_config(config)
        propulsion = config.propulsion
        recovery = config.recovery
        recovery_mass_kg = (
            recovery.lower_support_mass_kg
            + recovery.parachutes_mass_kg
            + recovery.piston_cap_mass_kg
            + recovery.ejection_charge_mass_kg
        )
        dry_motor_position_m = propulsion.dry_inertia.dry_center_of_mass_m
        fixed_point_masses = (
            PointMass(config.avionics.mass_kg, config.avionics.position_x_m),
            PointMass(config.payload.mass_kg, config.payload.position_x_m),
            PointMass(propulsion.combustion_chamber.empty_mass_kg, dry_motor_position_m),
            PointMass(config.structure.empty_mass_kg, config.structure.center_of_mass_m),
            PointMass(recovery_mass_kg, recovery.center_of_mass_m),
        )
        return cls(
            mass_model=mass_model,
            fixed_point_masses=fixed_point_masses,
            propellant_position_m=dry_motor_position_m,
        )

    def center_of_mass_m(self, t_s: float) -> float:
        """Posição do CM (m) no instante `t_s`."""
        fixed_moment_kg_m = sum(pm.mass_kg * pm.position_m for pm in self.fixed_point_masses)
        fixed_mass_kg = sum(pm.mass_kg for pm in self.fixed_point_masses)
        propellant_mass_kg = self.mass_model.propellant_mass_at(t_s)
        propellant_moment_kg_m = propellant_mass_kg * self.propellant_position_m
        total_mass_kg = fixed_mass_kg + propellant_mass_kg
        return (fixed_moment_kg_m + propellant_moment_kg_m) / total_mass_kg
