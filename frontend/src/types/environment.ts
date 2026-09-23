/** Espelha `app/environment/schemas.py` do backend. */

/** Localização, atmosfera e trilho de lançamento. */
export interface Environment {
  /** Latitude (graus). -90 <= latitude_deg <= 90 */
  latitude_deg: number;
  /** Longitude (graus). -180 <= longitude_deg <= 180 */
  longitude_deg: number;
  /** Elevação em relação ao nível do mar (m). -430.0 <= elevation_m <= 6000.0 */
  elevation_m: number;
  /** Velocidade do vento prevista (m/s). 0 <= wind_speed_m_s <= 30.0 */
  wind_speed_m_s: number;
  /** Comprimento do trilho de lançamento (m). 0 < launch_rail_length_m <= 10.0 */
  launch_rail_length_m: number;
  /** Inclinação do trilho de lançamento em relação à vertical (graus).
   * 0° = trilho vertical; sinal positivo inclina o trilho no sentido +X.
   * -45.0 <= launch_rail_angle_deg <= 45.0 */
  launch_rail_angle_deg: number;
}
