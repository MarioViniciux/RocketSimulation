"""Margem de estabilidade estática do foguete, em calibres."""

from dataclasses import dataclass

from app.schemas import RocketConfig
from app.simulation.center_of_mass import CenterOfMassModel
from app.simulation.center_of_pressure import CenterOfPressureModel


@dataclass(frozen=True)
class StaticStabilityModel:
    """Margem de estabilidade estática ao longo do voo.

    A margem é a distância entre o Centro de Pressão (CP) e o Centro de
    Massa (CM), expressa em calibres (múltiplos do diâmetro do corpo do
    foguete). O foguete é estaticamente estável quando o CP está atrás do
    CM (margem positiva); a prática usual de projeto busca margens entre
    1 e 2 calibres.
    """

    center_of_mass_model: CenterOfMassModel
    center_of_pressure_m: float
    body_diameter_m: float

    @classmethod
    def from_rocket_config(
        cls,
        config: RocketConfig,
        center_of_mass_model: CenterOfMassModel | None = None,
        center_of_pressure_model: CenterOfPressureModel | None = None,
    ) -> "StaticStabilityModel":
        center_of_mass_model = center_of_mass_model or CenterOfMassModel.from_rocket_config(config)
        center_of_pressure_model = (
            center_of_pressure_model or CenterOfPressureModel.from_rocket_config(config)
        )
        return cls(
            center_of_mass_model=center_of_mass_model,
            center_of_pressure_m=center_of_pressure_model.center_of_pressure_m,
            body_diameter_m=config.structure.body_diameter_m,
        )

    def stability_margin_calibers_at(self, t_s: float) -> float:
        """Margem de estabilidade estática (cal) no instante `t_s`."""
        center_of_mass_m = self.center_of_mass_model.center_of_mass_m(t_s)
        return (self.center_of_pressure_m - center_of_mass_m) / self.body_diameter_m

    def is_stable_at(self, t_s: float) -> bool:
        """`True` se o foguete é estaticamente estável (CP atrás do CM) no instante `t_s`."""
        return self.stability_margin_calibers_at(t_s) > 0.0
