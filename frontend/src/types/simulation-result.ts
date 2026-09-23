/** Espelha `app/simulation/schemas.py` do backend: o payload de resposta de
 * `POST /simulate`. */

/** Vetores temporais h(t), vz(t) e az(t) da simulação. */
export interface FlightTimeSeriesOutput {
  /** Instantes de tempo (s). */
  times_s: readonly number[];
  /** Altitude h(t) (m). */
  altitudes_m: readonly number[];
  /** Velocidade vertical vz(t) (m/s). */
  vertical_velocities_m_s: readonly number[];
  /** Aceleração vertical az(t) (m/s²). */
  vertical_accelerations_m_s2: readonly number[];
}

/** Resultados estruturados de uma simulação de voo completa. */
export interface SimulationResult {
  /** Altitude máxima atingida (m). */
  apogee_altitude_m: number;
  /** Margem de estabilidade estática no lançamento (cal). */
  stability_margin_calibers: number;
  /** Tempo efetivo de queima do motor (s). */
  burn_time_s: number;
  /** Velocidade terminal sob o drogue (m/s), se houver drogue configurado. */
  drogue_terminal_velocity_m_s: number | null;
  /** Velocidade terminal sob o main (m/s). */
  main_terminal_velocity_m_s: number;
  time_series: FlightTimeSeriesOutput;
}
