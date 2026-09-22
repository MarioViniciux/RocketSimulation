"""Testes de `CenterOfPressureModel` (método de Barrowman) contra resultados
clássicos conhecidos: CP da coifa proporcional ao comprimento, e CP de uma
aleta retangular sem enflechamento no quarto de corda a partir do bordo de
ataque da raiz.
"""

import math

import pytest

from app.simulation.center_of_pressure import CenterOfPressureModel, FinSetGeometry
from app.structure.schemas import NoseConeShape

_RECTANGULAR_UNSWEPT_FINS = FinSetGeometry(
    count=3,
    root_chord_m=0.1,
    tip_chord_m=0.1,
    semispan_m=0.05,
    mid_chord_sweep_m=0.0,
    root_leading_edge_position_m=1.0,
    body_radius_at_fins_m=0.025,
)


@pytest.mark.parametrize(
    "shape, factor",
    [
        (NoseConeShape.CONICAL, 2.0 / 3.0),
        (NoseConeShape.OGIVAL, 0.466),
        (NoseConeShape.PARABOLIC, 0.5),
    ],
)
def test_nose_cone_center_of_pressure_is_proportional_to_length(
    shape: NoseConeShape, factor: float
) -> None:
    length_m = 0.3
    model = CenterOfPressureModel(
        nose_cone_shape=shape, nose_cone_length_m=length_m, fins=_RECTANGULAR_UNSWEPT_FINS
    )
    assert model.nose_cone_center_of_pressure_m == pytest.approx(factor * length_m)


def test_rectangular_unswept_fins_cp_is_at_quarter_chord_from_root_leading_edge() -> None:
    model = CenterOfPressureModel(
        nose_cone_shape=NoseConeShape.CONICAL,
        nose_cone_length_m=0.3,
        fins=_RECTANGULAR_UNSWEPT_FINS,
    )
    # Aleta retangular (corda de raiz = corda de ponta) e sem enflechamento:
    # resultado clássico de asas retangulares, CP no quarto de corda.
    assert model.fins_center_of_pressure_m == pytest.approx(1.0 + 0.25 * 0.1)


def test_fins_normal_force_coefficient_slope_matches_barrowman_formula() -> None:
    fins = _RECTANGULAR_UNSWEPT_FINS
    model = CenterOfPressureModel(
        nose_cone_shape=NoseConeShape.CONICAL, nose_cone_length_m=0.3, fins=fins
    )
    body_diameter_m = 2.0 * fins.body_radius_at_fins_m
    span_ratio_squared = (fins.semispan_m / body_diameter_m) ** 2
    sweep_term = math.sqrt(
        1.0 + (2.0 * fins.mid_chord_sweep_m / (fins.root_chord_m + fins.tip_chord_m)) ** 2
    )
    body_interference_factor = 1.0 + fins.body_radius_at_fins_m / (
        fins.semispan_m + fins.body_radius_at_fins_m
    )
    expected = (
        4.0 * fins.count * span_ratio_squared / (1.0 + sweep_term)
    ) * body_interference_factor

    assert model.fins_normal_force_coefficient_slope == pytest.approx(expected)
    assert model.fins_normal_force_coefficient_slope == pytest.approx(8.0)


def test_total_center_of_pressure_is_cn_alpha_weighted_average() -> None:
    model = CenterOfPressureModel(
        nose_cone_shape=NoseConeShape.CONICAL,
        nose_cone_length_m=0.3,
        fins=_RECTANGULAR_UNSWEPT_FINS,
    )
    # CP coifa = 2/3 * 0.3 = 0.2 m (CN_alpha = 2.0); CP aletas = 1.025 m (CN_alpha = 8.0)
    expected = (2.0 * 0.2 + 8.0 * 1.025) / (2.0 + 8.0)
    assert model.center_of_pressure_m == pytest.approx(expected)
    assert model.center_of_pressure_m == pytest.approx(0.86)
