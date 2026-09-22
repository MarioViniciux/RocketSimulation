"""Testes de `StaticStabilityModel`: margem de estabilidade em calibres."""

import pytest

from app.simulation.center_of_mass import CenterOfMassModel, PointMass
from app.simulation.mass import VariableMassModel
from app.simulation.stability import StaticStabilityModel


def _stability_model(center_of_pressure_m: float, body_diameter_m: float) -> StaticStabilityModel:
    mass_model = VariableMassModel(dry_mass_kg=10.0, propellant_mass_kg=0.0, burn_time_s=1.0)
    center_of_mass_model = CenterOfMassModel(
        mass_model=mass_model,
        fixed_point_masses=(PointMass(mass_kg=10.0, position_m=0.5),),
        propellant_position_m=0.5,
    )
    return StaticStabilityModel(
        center_of_mass_model=center_of_mass_model,
        center_of_pressure_m=center_of_pressure_m,
        body_diameter_m=body_diameter_m,
    )


def test_stability_margin_is_distance_between_cp_and_cm_in_calibers() -> None:
    model = _stability_model(center_of_pressure_m=0.9, body_diameter_m=0.1)
    # CM fixo em 0.5 m (sem propelente); margem = (0.9 - 0.5) / 0.1 = 4 cal
    assert model.stability_margin_calibers_at(0.0) == pytest.approx(4.0)


def test_positive_margin_is_stable() -> None:
    model = _stability_model(center_of_pressure_m=0.9, body_diameter_m=0.1)
    assert model.is_stable_at(0.0) is True


def test_non_positive_margin_is_not_stable() -> None:
    model = _stability_model(center_of_pressure_m=0.5, body_diameter_m=0.1)
    assert model.is_stable_at(0.0) is False
