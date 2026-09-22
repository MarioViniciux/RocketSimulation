"""Testes de `CenterOfMassModel`: média ponderada de massas fixas e propelente."""

import pytest

from app.simulation.center_of_mass import CenterOfMassModel, PointMass
from app.simulation.mass import VariableMassModel


def _model() -> CenterOfMassModel:
    mass_model = VariableMassModel(dry_mass_kg=10.0, propellant_mass_kg=2.0, burn_time_s=4.0)
    fixed_point_masses = (
        PointMass(mass_kg=6.0, position_m=0.0),
        PointMass(mass_kg=4.0, position_m=2.0),
    )
    return CenterOfMassModel(
        mass_model=mass_model,
        fixed_point_masses=fixed_point_masses,
        propellant_position_m=1.0,
    )


def test_rejects_fixed_masses_inconsistent_with_dry_mass() -> None:
    mass_model = VariableMassModel(dry_mass_kg=10.0, propellant_mass_kg=2.0, burn_time_s=4.0)
    with pytest.raises(ValueError):
        CenterOfMassModel(
            mass_model=mass_model,
            fixed_point_masses=(PointMass(mass_kg=5.0, position_m=0.0),),
            propellant_position_m=1.0,
        )


def test_center_of_mass_at_liftoff_weights_propellant_mass() -> None:
    # massa total = 6 + 4 + 2 = 12 kg; momento = 6*0 + 4*2 + 2*1 = 10 kg*m
    assert _model().center_of_mass_m(0.0) == pytest.approx(10.0 / 12.0)


def test_center_of_mass_at_burnout_excludes_propellant() -> None:
    # massa total = 6 + 4 = 10 kg; momento = 6*0 + 4*2 = 8 kg*m
    assert _model().center_of_mass_m(4.0) == pytest.approx(0.8)


def test_center_of_mass_moves_monotonically_toward_dry_configuration_as_propellant_burns() -> None:
    model = _model()
    cm_liftoff = model.center_of_mass_m(0.0)
    cm_mid_burn = model.center_of_mass_m(2.0)
    cm_burnout = model.center_of_mass_m(4.0)
    assert cm_liftoff > cm_mid_burn > cm_burnout
