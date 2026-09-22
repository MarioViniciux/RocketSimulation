"""Schema de saída estruturada de uma simulação de voo completa."""

from pydantic import BaseModel, Field


class FlightTimeSeriesOutput(BaseModel):
    """Vetores temporais h(t), vz(t) e az(t) da simulação."""

    times_s: tuple[float, ...] = Field(..., description="Instantes de tempo (s).")
    altitudes_m: tuple[float, ...] = Field(..., description="Altitude h(t) (m).")
    vertical_velocities_m_s: tuple[float, ...] = Field(
        ..., description="Velocidade vertical vz(t) (m/s)."
    )
    vertical_accelerations_m_s2: tuple[float, ...] = Field(
        ..., description="Aceleração vertical az(t) (m/s²)."
    )


class SimulationResult(BaseModel):
    """Resultados estruturados de uma simulação de voo completa."""

    apogee_altitude_m: float = Field(..., description="Altitude máxima atingida (m).")
    stability_margin_calibers: float = Field(
        ..., description="Margem de estabilidade estática no lançamento (cal)."
    )
    burn_time_s: float = Field(..., description="Tempo efetivo de queima do motor (s).")
    drogue_terminal_velocity_m_s: float | None = Field(
        default=None,
        description="Velocidade terminal sob o drogue (m/s), se houver drogue configurado.",
    )
    main_terminal_velocity_m_s: float = Field(
        ..., description="Velocidade terminal sob o main (m/s)."
    )
    time_series: FlightTimeSeriesOutput
