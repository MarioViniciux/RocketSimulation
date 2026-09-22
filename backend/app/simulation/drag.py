"""Arrasto aerodinâmico subsônico/compressível, em função do Número de Mach."""

import math
from dataclasses import dataclass

from app.schemas import RocketConfig


def mach_number(velocity_m_s: float, speed_of_sound_m_s: float) -> float:
    """Número de Mach a partir da velocidade do foguete e da velocidade do som local."""
    return abs(velocity_m_s) / speed_of_sound_m_s


def compressibility_factor(mach: float) -> float:
    """Fator de correção de compressibilidade do coeficiente de arrasto, `Cd(M) / Cd0`.

    Regime subsônico (M < 1): regra de Prandtl-Glauert, `1 / sqrt(1 - M^2)`, que
    modela o aumento do arrasto à medida que o escoamento se aproxima da
    velocidade do som (pico de arrasto transônico). O Mach é limitado a 0.99
    para evitar a singularidade matemática em M = 1.

    Regime supersônico (M >= 1): análogo supersônico da teoria linearizada de
    Ackeret, `1 / sqrt(M^2 - 1)`, que reproduz a queda gradual do arrasto após
    o pico transônico. O Mach é limitado a um mínimo de 1.01 pela mesma razão.
    """
    if mach < 1.0:
        effective_mach = min(mach, 0.99)
        return 1.0 / math.sqrt(1.0 - effective_mach**2)
    effective_mach = max(mach, 1.01)
    return 1.0 / math.sqrt(effective_mach**2 - 1.0)


@dataclass(frozen=True)
class DragModel:
    """Força de arrasto aerodinâmico do foguete, considerando efeitos de compressibilidade.

    `subsonic_drag_coefficient` é o coeficiente de arrasto (Cd0) de referência em
    baixo Número de Mach (escoamento essencialmente incompressível), e
    `reference_area_m2` é a área frontal de referência do foguete usada para
    adimensionalizar a força de arrasto.
    """

    reference_area_m2: float
    subsonic_drag_coefficient: float

    @classmethod
    def from_rocket_config(cls, config: RocketConfig) -> "DragModel":
        structure = config.structure
        reference_radius_m = structure.body_diameter_m / 2.0
        reference_area_m2 = math.pi * reference_radius_m**2
        return cls(
            reference_area_m2=reference_area_m2,
            subsonic_drag_coefficient=structure.drag_coefficient,
        )

    def drag_coefficient(self, mach: float) -> float:
        """Coeficiente de arrasto `Cd(M)`, corrigido pela compressibilidade."""
        return self.subsonic_drag_coefficient * compressibility_factor(mach)

    def drag_force_n(
        self, velocity_m_s: float, air_density_kg_m3: float, speed_of_sound_m_s: float
    ) -> float:
        """Força de arrasto (N), oposta ao sentido da velocidade (voo ao longo de um eixo).

        Retorna 0 N para velocidade nula.
        """
        if velocity_m_s == 0.0:
            return 0.0
        mach = mach_number(velocity_m_s, speed_of_sound_m_s)
        drag_coefficient = self.drag_coefficient(mach)
        magnitude_n = (
            0.5 * drag_coefficient * air_density_kg_m3 * velocity_m_s**2 * self.reference_area_m2
        )
        return -math.copysign(magnitude_n, velocity_m_s)
