from pydantic import BaseModel, Field, model_validator


class Recovery(BaseModel):
    """Sistema de recuperação."""

    has_drogue: bool = Field(..., description="Presença de paraquedas drogue (piloto).")
    lower_support_mass_kg: float = Field(
        ..., gt=0, le=10.0, description="Massa do suporte inferior (kg)."
    )
    parachutes_mass_kg: float = Field(
        ...,
        gt=0,
        le=10.0,
        description=(
            "Massa dos paraquedas (kg). Se houver drogue, soma da massa do drogue com a do main."
        ),
    )
    piston_cap_mass_kg: float = Field(
        ..., gt=0, le=5.0, description="Massa da tampa do pistão (kg)."
    )
    ejection_charge_mass_kg: float = Field(
        ..., gt=0, le=0.1, description="Massa de pólvora de ejeção (kg)."
    )
    center_of_mass_m: float = Field(
        ...,
        ge=-10.0,
        le=10.0,
        description=(
            "Posição do centro de massa do conjunto de recuperação "
            "ao longo do eixo do foguete (m)."
        ),
    )
    predicted_terminal_velocity_m_s: float = Field(
        ..., gt=0, le=50.0, description="Velocidade terminal prevista (m/s)."
    )
    drogue_deployment_time_s: float | None = Field(
        default=None,
        ge=0,
        le=60.0,
        description=(
            "Tempo de ativação do drogue após o apogeu (s). Aplicável apenas se has_drogue=True."
        ),
    )
    drogue_drag_coefficient: float | None = Field(
        default=None,
        gt=0,
        le=2.0,
        description=(
            "Coeficiente de arrasto (Cd) do paraquedas drogue. "
            "Aplicável apenas se has_drogue=True."
        ),
    )
    drogue_diameter_m: float | None = Field(
        default=None,
        gt=0,
        le=5.0,
        description="Diâmetro do paraquedas drogue (m). Aplicável apenas se has_drogue=True.",
    )
    main_deployment_time_s: float = Field(
        ..., ge=0, le=300.0, description="Tempo de ativação do main após o apogeu (s)."
    )
    main_drag_coefficient: float = Field(
        ..., gt=0, le=2.0, description="Coeficiente de arrasto (Cd) do paraquedas main."
    )
    main_diameter_m: float = Field(
        ..., gt=0, le=10.0, description="Diâmetro do paraquedas main (m)."
    )
    predicted_search_radius_m: float = Field(
        ..., gt=0, le=20000.0, description="Raio de busca previsto (m)."
    )

    @model_validator(mode="after")
    def validate_drogue_fields(self) -> "Recovery":
        drogue_fields = (
            self.drogue_deployment_time_s,
            self.drogue_drag_coefficient,
            self.drogue_diameter_m,
        )
        if self.has_drogue and any(field is None for field in drogue_fields):
            raise ValueError(
                "drogue_deployment_time_s, drogue_drag_coefficient e drogue_diameter_m "
                "são obrigatórios quando has_drogue=True."
            )
        if not self.has_drogue and any(field is not None for field in drogue_fields):
            raise ValueError(
                "drogue_deployment_time_s, drogue_drag_coefficient e drogue_diameter_m "
                "devem ser omitidos quando has_drogue=False."
            )
        return self
