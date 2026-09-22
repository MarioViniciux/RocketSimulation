"""Velocidade terminal do foguete sob paraquedas (drogue e/ou main).

Calculada em regime quase-estático (equilíbrio entre arrasto e peso),
`v_terminal = sqrt(2*m*g / (rho*Cd*A))`, com `A` a área do paraquedas
(assumido circular) e `rho`/`g` avaliados na altitude em que o cálculo é
solicitado (tipicamente a altitude de ativação de cada paraquedas). Ao
contrário do arrasto do corpo do foguete (`DragModel`), não se aplica
correção de compressibilidade: a descida sob paraquedas ocorre em
velocidades muito abaixo da velocidade do som.
"""

import math
from dataclasses import dataclass

from app.schemas import RocketConfig
from app.simulation.atmosphere import AtmosphereModel


def _canopy_area_m2(diameter_m: float) -> float:
    return math.pi * (diameter_m / 2.0) ** 2


def _terminal_velocity_m_s(
    mass_kg: float,
    gravity_m_s2: float,
    air_density_kg_m3: float,
    drag_coefficient: float,
    area_m2: float,
) -> float:
    return math.sqrt(
        (2.0 * mass_kg * gravity_m_s2) / (air_density_kg_m3 * drag_coefficient * area_m2)
    )


@dataclass(frozen=True)
class ParachuteTerminalVelocityModel:
    """Velocidade terminal sob o paraquedas drogue e/ou main."""

    atmosphere_model: AtmosphereModel
    has_drogue: bool
    drogue_drag_coefficient: float | None
    drogue_diameter_m: float | None
    main_drag_coefficient: float
    main_diameter_m: float

    @classmethod
    def from_rocket_config(
        cls, config: RocketConfig, atmosphere_model: AtmosphereModel | None = None
    ) -> "ParachuteTerminalVelocityModel":
        recovery = config.recovery
        return cls(
            atmosphere_model=atmosphere_model or AtmosphereModel.from_rocket_config(config),
            has_drogue=recovery.has_drogue,
            drogue_drag_coefficient=recovery.drogue_drag_coefficient,
            drogue_diameter_m=recovery.drogue_diameter_m,
            main_drag_coefficient=recovery.main_drag_coefficient,
            main_diameter_m=recovery.main_diameter_m,
        )

    def drogue_terminal_velocity_m_s(self, altitude_agl_m: float, mass_kg: float) -> float:
        """Velocidade terminal (m/s) sob o drogue, na altitude AGL informada."""
        if (
            not self.has_drogue
            or self.drogue_drag_coefficient is None
            or self.drogue_diameter_m is None
        ):
            raise ValueError("Não há paraquedas drogue configurado (has_drogue=False).")
        gravity_m_s2 = self.atmosphere_model.gravity_m_s2(altitude_agl_m)
        air_density_kg_m3 = self.atmosphere_model.density_kg_m3(altitude_agl_m)
        area_m2 = _canopy_area_m2(self.drogue_diameter_m)
        return _terminal_velocity_m_s(
            mass_kg, gravity_m_s2, air_density_kg_m3, self.drogue_drag_coefficient, area_m2
        )

    def main_terminal_velocity_m_s(self, altitude_agl_m: float, mass_kg: float) -> float:
        """Velocidade terminal (m/s) sob o main, na altitude AGL informada."""
        gravity_m_s2 = self.atmosphere_model.gravity_m_s2(altitude_agl_m)
        air_density_kg_m3 = self.atmosphere_model.density_kg_m3(altitude_agl_m)
        area_m2 = _canopy_area_m2(self.main_diameter_m)
        return _terminal_velocity_m_s(
            mass_kg, gravity_m_s2, air_density_kg_m3, self.main_drag_coefficient, area_m2
        )
