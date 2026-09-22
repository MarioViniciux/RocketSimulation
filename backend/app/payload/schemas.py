from pydantic import BaseModel, Field


class Payload(BaseModel):
    """Satélite / carga útil."""

    mass_kg: float = Field(..., gt=0, le=50.0, description="Massa do sistema completo (kg).")
    position_x_m: float = Field(
        ..., ge=-10.0, le=10.0, description="Posição X ao longo do eixo do foguete (m)."
    )
    position_y_m: float = Field(..., ge=-10.0, le=10.0, description="Posição Y (m).")
    position_z_m: float = Field(..., ge=-10.0, le=10.0, description="Posição Z (m).")
    diameter_m: float = Field(..., gt=0, le=0.5, description="Diâmetro do sistema (m).")
    length_m: float = Field(..., gt=0, le=2.0, description="Comprimento do sistema (m).")
