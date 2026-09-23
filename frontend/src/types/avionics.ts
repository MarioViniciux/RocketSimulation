/** Espelha `app/avionics/schemas.py` do backend. */

/** Sistema de aviônica. */
export interface Avionics {
  /** Massa do sistema completo (kg). 0 < mass_kg <= 50.0 */
  mass_kg: number;
  /** Posição X ao longo do eixo do foguete (m). -10.0 <= position_x_m <= 10.0 */
  position_x_m: number;
  /** Posição Y (m). -10.0 <= position_y_m <= 10.0 */
  position_y_m: number;
  /** Posição Z (m). -10.0 <= position_z_m <= 10.0 */
  position_z_m: number;
  /** Diâmetro do sistema (m). 0 < diameter_m <= 0.5 */
  diameter_m: number;
  /** Comprimento do sistema (m). 0 < length_m <= 2.0 */
  length_m: number;
}
