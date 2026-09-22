"""Modelo atmosférico: densidade, pressão e gravidade local em função da altitude/coordenadas."""

import math
from dataclasses import dataclass

from app.environment.schemas import Environment
from app.schemas import RocketConfig

_STANDARD_GRAVITY_M_S2 = 9.80665
_SPECIFIC_GAS_CONSTANT_AIR_J_KG_K = 287.05287
_EARTH_MEAN_RADIUS_M = 6_371_000.0

# Atmosfera Padrão Internacional (ISA/ICAO): camadas definidas por
# (altitude base (m), temperatura base (K), taxa de lapso (K/m), pressão base (Pa)).
_ISA_LAYERS: tuple[tuple[float, float, float, float], ...] = (
    (0.0, 288.15, -0.0065, 101_325.0),
    (11_000.0, 216.65, 0.0, 22_632.06),
    (20_000.0, 216.65, 0.001, 5_474.89),
    (32_000.0, 228.65, 0.0028, 868.02),
    (47_000.0, 270.65, 0.0, 110.91),
    (51_000.0, 270.65, -0.0028, 66.94),
    (71_000.0, 214.65, -0.002, 3.96),
)
_ISA_TOP_ALTITUDE_M = 84_852.0


def _sea_level_gravity_m_s2(latitude_deg: float) -> float:
    """Gravidade ao nível do mar em função da latitude (fórmula de Somigliana, WGS84)."""
    phi_rad = math.radians(latitude_deg)
    sin2_phi = math.sin(phi_rad) ** 2
    numerator = 1 + 0.00193185265241 * sin2_phi
    denominator = math.sqrt(1 - 0.00669437999014 * sin2_phi)
    return 9.7803253359 * numerator / denominator


@dataclass(frozen=True)
class AtmosphereModel:
    """Propriedades atmosféricas e gravidade local ao longo da altitude de voo.

    A altitude de referência (nível do mar) é a soma da elevação do local de
    lançamento com a altura acima do solo (AGL) atingida pelo foguete. A
    temperatura e a pressão seguem o modelo da Atmosfera Padrão Internacional
    (ISA), por camadas. A densidade é obtida pela lei dos gases ideais. A
    gravidade local combina a variação com a latitude (fórmula de Somigliana)
    com a correção de ar livre pela altitude (lei do inverso do quadrado).
    """

    latitude_deg: float
    elevation_m: float

    @classmethod
    def from_environment(cls, environment: Environment) -> "AtmosphereModel":
        return cls(latitude_deg=environment.latitude_deg, elevation_m=environment.elevation_m)

    @classmethod
    def from_rocket_config(cls, config: RocketConfig) -> "AtmosphereModel":
        return cls.from_environment(config.environment)

    def altitude_msl_m(self, altitude_agl_m: float) -> float:
        """Altitude em relação ao nível do mar (m) para uma altura AGL dada."""
        return self.elevation_m + altitude_agl_m

    def temperature_k(self, altitude_agl_m: float) -> float:
        """Temperatura do ar (K) na altitude AGL informada."""
        altitude_msl_m = min(max(self.altitude_msl_m(altitude_agl_m), 0.0), _ISA_TOP_ALTITUDE_M)
        base_altitude_m, base_temperature_k, lapse_rate_k_m, _ = self._layer_at(altitude_msl_m)
        return base_temperature_k + lapse_rate_k_m * (altitude_msl_m - base_altitude_m)

    def pressure_pa(self, altitude_agl_m: float) -> float:
        """Pressão atmosférica (Pa) na altitude AGL informada."""
        altitude_msl_m = min(max(self.altitude_msl_m(altitude_agl_m), 0.0), _ISA_TOP_ALTITUDE_M)
        base_altitude_m, base_temperature_k, lapse_rate_k_m, base_pressure_pa = self._layer_at(
            altitude_msl_m
        )
        if lapse_rate_k_m == 0.0:
            exponent = (
                -_STANDARD_GRAVITY_M_S2
                * (altitude_msl_m - base_altitude_m)
                / (_SPECIFIC_GAS_CONSTANT_AIR_J_KG_K * base_temperature_k)
            )
            return base_pressure_pa * math.exp(exponent)
        temperature_ratio = self.temperature_k(altitude_agl_m) / base_temperature_k
        exponent = -_STANDARD_GRAVITY_M_S2 / (
            _SPECIFIC_GAS_CONSTANT_AIR_J_KG_K * lapse_rate_k_m
        )
        return base_pressure_pa * float(temperature_ratio**exponent)

    def density_kg_m3(self, altitude_agl_m: float) -> float:
        """Densidade do ar (kg/m³) na altitude AGL informada, pela lei dos gases ideais."""
        pressure_pa = self.pressure_pa(altitude_agl_m)
        temperature_k = self.temperature_k(altitude_agl_m)
        return pressure_pa / (_SPECIFIC_GAS_CONSTANT_AIR_J_KG_K * temperature_k)

    def gravity_m_s2(self, altitude_agl_m: float) -> float:
        """Gravidade local (m/s²) na altitude AGL informada, para a latitude do local."""
        altitude_msl_m = self.altitude_msl_m(altitude_agl_m)
        sea_level_gravity = _sea_level_gravity_m_s2(self.latitude_deg)
        return sea_level_gravity * (
            _EARTH_MEAN_RADIUS_M / (_EARTH_MEAN_RADIUS_M + altitude_msl_m)
        ) ** 2

    @staticmethod
    def _layer_at(altitude_msl_m: float) -> tuple[float, float, float, float]:
        layer = _ISA_LAYERS[0]
        for candidate in _ISA_LAYERS:
            if candidate[0] > altitude_msl_m:
                break
            layer = candidate
        return layer
