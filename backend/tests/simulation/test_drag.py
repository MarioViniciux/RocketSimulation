"""Testes de `DragModel` e da correção de compressibilidade contra fórmulas
conhecidas (Prandtl-Glauert subsônico, análogo de Ackeret supersônico)."""

import math

import pytest

from app.simulation.drag import DragModel, compressibility_factor, mach_number


def test_mach_number_is_absolute_speed_ratio() -> None:
    assert mach_number(340.0, 340.0) == pytest.approx(1.0)
    assert mach_number(-170.0, 340.0) == pytest.approx(0.5)


def test_compressibility_factor_is_one_at_zero_mach() -> None:
    assert compressibility_factor(0.0) == pytest.approx(1.0)


def test_compressibility_factor_follows_prandtl_glauert_below_mach_one() -> None:
    assert compressibility_factor(0.5) == pytest.approx(1.0 / math.sqrt(1.0 - 0.5**2))


def test_compressibility_factor_is_clamped_near_the_sonic_singularity() -> None:
    # M=1.0 cai no ramo supersônico (M >= 1.0) e é limitado a 1.01 antes de
    # calcular 1/sqrt(M^2 - 1), evitando divisão por zero em M = 1.
    assert compressibility_factor(1.0) == pytest.approx(1.0 / math.sqrt(1.01**2 - 1.0))


def test_compressibility_factor_follows_ackeret_theory_above_mach_one() -> None:
    assert compressibility_factor(2.0) == pytest.approx(1.0 / math.sqrt(3.0))


def test_drag_force_is_zero_at_zero_velocity() -> None:
    model = DragModel(reference_area_m2=0.01, subsonic_drag_coefficient=0.5)
    assert model.drag_force_n(0.0, air_density_kg_m3=1.225, speed_of_sound_m_s=340.0) == 0.0


def test_drag_force_matches_the_dynamic_pressure_formula() -> None:
    model = DragModel(reference_area_m2=0.02, subsonic_drag_coefficient=0.5)
    velocity_m_s = 100.0
    air_density_kg_m3 = 1.225
    speed_of_sound_m_s = 340.0

    mach = mach_number(velocity_m_s, speed_of_sound_m_s)
    expected_cd = 0.5 * compressibility_factor(mach)
    expected_magnitude_n = 0.5 * expected_cd * air_density_kg_m3 * velocity_m_s**2 * 0.02

    drag_force_n = model.drag_force_n(velocity_m_s, air_density_kg_m3, speed_of_sound_m_s)
    assert drag_force_n == pytest.approx(-expected_magnitude_n)


def test_drag_force_always_opposes_the_velocity_direction() -> None:
    model = DragModel(reference_area_m2=0.02, subsonic_drag_coefficient=0.5)
    forward = model.drag_force_n(100.0, 1.225, 340.0)
    backward = model.drag_force_n(-100.0, 1.225, 340.0)
    assert forward < 0.0
    assert backward > 0.0
    assert backward == pytest.approx(-forward)
