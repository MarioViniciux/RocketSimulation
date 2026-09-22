from enum import StrEnum

from pydantic import BaseModel, Field


class NoseConeShape(StrEnum):
    OGIVAL = "ogival"
    PARABOLIC = "parabolico"
    CONICAL = "conico"


class NoseCone(BaseModel):
    """Coifa (nose cone)."""

    shape: NoseConeShape = Field(..., description="Formato da coifa.")
    length_m: float = Field(..., gt=0, le=2.0, description="Comprimento da coifa (m).")
    mass_kg: float = Field(..., gt=0, le=20.0, description="Massa da coifa (kg).")


class Fins(BaseModel):
    """Aletas."""

    count: int = Field(..., ge=1, le=8, description="Quantidade de aletas.")
    mounting_angle_deg: float = Field(
        ..., ge=-15.0, le=15.0, description="Angulação de montagem (cant) das aletas (graus)."
    )


class RailButtons(BaseModel):
    """Guias de lançamento (rail buttons)."""

    count: int = Field(..., ge=1, le=6, description="Quantidade de rail buttons.")
    angle_deg: float = Field(
        ...,
        ge=0.0,
        le=360.0,
        description="Angulação (posição angular ao redor da fuselagem) dos rail buttons (graus).",
    )


class Structure(BaseModel):
    """Módulo agregador de Estrutura."""

    empty_mass_kg: float = Field(
        ...,
        gt=0,
        le=100.0,
        description="Massa da estrutura totalmente vazia, incluindo coifa (kg).",
    )
    total_length_m: float = Field(
        ..., gt=0, le=10.0, description="Comprimento total do foguete, com coifa (m)."
    )
    nose_cone: NoseCone
    fins: Fins
    rail_buttons: RailButtons
