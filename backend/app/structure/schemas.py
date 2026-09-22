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
    root_chord_m: float = Field(..., gt=0, le=1.0, description="Corda de raiz da aleta (m).")
    tip_chord_m: float = Field(..., ge=0, le=1.0, description="Corda de ponta da aleta (m).")
    semispan_m: float = Field(
        ..., gt=0, le=0.5, description="Envergadura (semi-span) da aleta (m)."
    )
    mid_chord_sweep_m: float = Field(
        ...,
        ge=0,
        le=1.0,
        description=(
            "Enflechamento: distância paralela ao corpo entre os bordos de ataque "
            "da raiz e da ponta da aleta (m)."
        ),
    )
    root_leading_edge_position_m: float = Field(
        ...,
        ge=0,
        le=10.0,
        description="Distância da ponta do nariz até o bordo de ataque da raiz da aleta (m).",
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
    body_diameter_m: float = Field(
        ..., gt=0, le=0.5, description="Diâmetro do corpo (fuselagem) do foguete (m)."
    )
    nose_cone: NoseCone
    fins: Fins
    rail_buttons: RailButtons
