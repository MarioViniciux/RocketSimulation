from pydantic import BaseModel, Field


class CombustionChamber(BaseModel):
    """Câmara de combustão do motor."""

    length_m: float = Field(..., gt=0, le=2.0, description="Comprimento da câmara (m).")
    diameter_m: float = Field(..., gt=0, le=0.5, description="Diâmetro da câmara (m).")
    empty_mass_kg: float = Field(..., gt=0, le=50.0, description="Massa da câmara vazia (kg).")


class PropellantGrain(BaseModel):
    """Grão propelente."""

    propellant_mass_kg: float = Field(
        ..., gt=0, le=50.0, description="Massa total do propelente (kg)."
    )
    grain_count: int = Field(..., ge=1, le=20, description="Quantidade de grãos.")
    grain_diameter_m: float = Field(..., gt=0, le=0.5, description="Diâmetro de um grão (m).")
    single_grain_burn_time_s: float = Field(
        ..., gt=0, le=30.0, description="Tempo de queima de um único grão (s)."
    )


class Nozzle(BaseModel):
    """Bocal convergente-divergente."""

    throat_diameter_m: float = Field(..., gt=0, le=0.3, description="Diâmetro da garganta (m).")
    exit_diameter_m: float = Field(..., gt=0, le=0.5, description="Diâmetro de saída (m).")
    length_m: float = Field(..., gt=0, le=1.0, description="Comprimento do bocal (m).")
    position_m: float = Field(
        ..., ge=-5.0, le=5.0, description="Posição do bocal ao longo do eixo do motor (m)."
    )


class DryInertia(BaseModel):
    """Inércia e massa a seco do motor."""

    dry_inertia_kg_m2: float = Field(
        ..., gt=0, le=50.0, description="Inércia seca em torno do eixo transversal (kg·m²)."
    )
    dry_center_of_mass_m: float = Field(
        ..., ge=-5.0, le=5.0, description="Posição do centro de massa seco (CM_seco) (m)."
    )


class ThermodynamicImpulseParameters(BaseModel):
    """Parâmetros termodinâmicos e de impulso do motor."""

    reference_pressure_pa: float = Field(
        ..., gt=0, le=2.0e7, description="Pressão de referência da câmara (Pa)."
    )
    total_impulse_ns: float = Field(
        ..., gt=0, le=1.0e5, description="Impulso total do motor (N·s)."
    )
    pressure_impulse_ns: float = Field(
        ..., gt=0, le=5000.0, description="Impulso de pressão (N·s)."
    )
    exhaust_velocity_m_s: float = Field(
        ..., gt=0, le=3000.0, description="Velocidade de exaustão dos gases (m/s)."
    )


class Propulsion(BaseModel):
    """Módulo agregador de Propulsão."""

    combustion_chamber: CombustionChamber = Field(..., description="Câmara de combustão.")
    propellant_grain: PropellantGrain = Field(..., description="Grão propelente.")
    nozzle: Nozzle = Field(..., description="Bocal convergente-divergente.")
    dry_inertia: DryInertia = Field(..., description="Inércia e centro de massa a seco.")
    thermodynamic_impulse_parameters: ThermodynamicImpulseParameters = Field(
        ..., description="Parâmetros termodinâmicos e de impulso."
    )
