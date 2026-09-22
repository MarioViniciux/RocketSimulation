"""Centro de Pressão (CP) do foguete, pelo método de Barrowman.

O método de Barrowman (1966) é a referência clássica para estimar a
margem de estabilidade estática de foguetes de aletas em escoamento
subsônico. Ele soma as contribuições da coifa e das aletas para o
coeficiente de força normal (`CN_alpha`) e localiza o CP resultante como
a média dessas contribuições ponderada por `CN_alpha`. Efeitos de
compressibilidade (deslocamento do CP com o Número de Mach) e a
contribuição do corpo cilíndrico/coifa em ângulo de ataque não são
modelados nesta primeira versão.

Nota sobre o schema atual: `Structure.Fins` (ver `app/structure/schemas.py`)
hoje só armazena a quantidade de aletas e o ângulo de montagem (cant), sem
geometria de planta (corda de raiz/ponta, envergadura, enflechamento) nem o
diâmetro do corpo do foguete — todos exigidos pelo método de Barrowman. Por
isso, `FinSetGeometry` é recebida como parâmetro explícito, e não derivada
do `RocketConfig`.
"""

import math
from dataclasses import dataclass

from app.structure.schemas import NoseConeShape

_NOSE_CONE_NORMAL_FORCE_COEFFICIENT_SLOPE = 2.0

# Fator k tal que CP_coifa = k * comprimento_da_coifa, por formato (Barrowman).
_NOSE_CONE_CENTER_OF_PRESSURE_FACTOR: dict[NoseConeShape, float] = {
    NoseConeShape.CONICAL: 2.0 / 3.0,
    NoseConeShape.OGIVAL: 0.466,
    NoseConeShape.PARABOLIC: 0.5,
}


@dataclass(frozen=True)
class FinSetGeometry:
    """Geometria de um conjunto de aletas trapezoidais idênticas e igualmente espaçadas."""

    count: int
    root_chord_m: float
    tip_chord_m: float
    semispan_m: float
    mid_chord_sweep_m: float
    root_leading_edge_position_m: float
    body_radius_at_fins_m: float


@dataclass(frozen=True)
class CenterOfPressureModel:
    """CP do foguete (m, a partir da ponta do nariz), pelo método de Barrowman."""

    nose_cone_shape: NoseConeShape
    nose_cone_length_m: float
    fins: FinSetGeometry

    @property
    def nose_cone_normal_force_coefficient_slope(self) -> float:
        """`CN_alpha` da coifa: constante, independente do formato (teoria linearizada)."""
        return _NOSE_CONE_NORMAL_FORCE_COEFFICIENT_SLOPE

    @property
    def nose_cone_center_of_pressure_m(self) -> float:
        """CP da coifa (m), proporcional ao seu comprimento."""
        factor = _NOSE_CONE_CENTER_OF_PRESSURE_FACTOR[self.nose_cone_shape]
        return factor * self.nose_cone_length_m

    @property
    def fins_normal_force_coefficient_slope(self) -> float:
        """`CN_alpha` do conjunto de aletas (equação de Barrowman)."""
        fins = self.fins
        body_diameter_m = 2.0 * fins.body_radius_at_fins_m
        span_ratio_squared = (fins.semispan_m / body_diameter_m) ** 2
        sweep_term = math.sqrt(
            1.0 + (2.0 * fins.mid_chord_sweep_m / (fins.root_chord_m + fins.tip_chord_m)) ** 2
        )
        body_interference_factor = 1.0 + fins.body_radius_at_fins_m / (
            fins.semispan_m + fins.body_radius_at_fins_m
        )
        return (
            4.0 * fins.count * span_ratio_squared / (1.0 + sweep_term)
        ) * body_interference_factor

    @property
    def fins_center_of_pressure_m(self) -> float:
        """CP do conjunto de aletas (m), medido a partir da ponta do nariz."""
        fins = self.fins
        chord_sum_m = fins.root_chord_m + fins.tip_chord_m
        sweep_contribution_m = (
            fins.mid_chord_sweep_m
            * (fins.root_chord_m + 2.0 * fins.tip_chord_m)
            / (3.0 * chord_sum_m)
        )
        chord_contribution_m = (
            chord_sum_m - (fins.root_chord_m * fins.tip_chord_m) / chord_sum_m
        ) / 6.0
        return fins.root_leading_edge_position_m + sweep_contribution_m + chord_contribution_m

    @property
    def normal_force_coefficient_slope(self) -> float:
        """`CN_alpha` total do foguete (soma das contribuições da coifa e das aletas)."""
        return (
            self.nose_cone_normal_force_coefficient_slope + self.fins_normal_force_coefficient_slope
        )

    @property
    def center_of_pressure_m(self) -> float:
        """CP total do foguete (m), a partir da ponta do nariz."""
        cn_alpha_nose = self.nose_cone_normal_force_coefficient_slope
        cn_alpha_fins = self.fins_normal_force_coefficient_slope
        weighted_cp_m = (
            cn_alpha_nose * self.nose_cone_center_of_pressure_m
            + cn_alpha_fins * self.fins_center_of_pressure_m
        )
        return weighted_cp_m / self.normal_force_coefficient_slope
