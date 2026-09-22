from pydantic import BaseModel, Field


class Environment(BaseModel):
    """Localização, atmosfera e trilho de lançamento."""

    latitude_deg: float = Field(..., ge=-90, le=90, description="Latitude (graus).")
    longitude_deg: float = Field(..., ge=-180, le=180, description="Longitude (graus).")
    elevation_m: float = Field(
        ..., ge=-430.0, le=6000.0, description="Elevação em relação ao nível do mar (m)."
    )
    wind_speed_m_s: float = Field(
        ..., ge=0, le=30.0, description="Velocidade do vento prevista (m/s)."
    )
    launch_rail_length_m: float = Field(
        ..., gt=0, le=10.0, description="Comprimento do trilho de lançamento (m)."
    )
    launch_rail_angle_deg: float = Field(
        ...,
        ge=-45.0,
        le=45.0,
        description=(
            "Inclinação do trilho de lançamento em relação à vertical (graus). "
            "0° = trilho vertical; sinal positivo inclina o trilho no sentido +X."
        ),
    )
