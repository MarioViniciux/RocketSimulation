/** Espelha `app/recovery/schemas.py` do backend.
 *
 * Os campos `drogue_*` são obrigatórios (não `null`) quando `has_drogue` é
 * `true`, e devem ser `null` quando `has_drogue` é `false` — validado pelo
 * backend (`validate_drogue_fields`), não pelo tipo TypeScript. */

/** Sistema de recuperação. */
export interface Recovery {
  /** Presença de paraquedas drogue (piloto). */
  has_drogue: boolean;
  /** Massa do suporte inferior (kg). 0 < lower_support_mass_kg <= 10.0 */
  lower_support_mass_kg: number;
  /** Massa dos paraquedas (kg). Se houver drogue, soma da massa do drogue
   * com a do main. 0 < parachutes_mass_kg <= 10.0 */
  parachutes_mass_kg: number;
  /** Massa da tampa do pistão (kg). 0 < piston_cap_mass_kg <= 5.0 */
  piston_cap_mass_kg: number;
  /** Massa de pólvora de ejeção (kg). 0 < ejection_charge_mass_kg <= 0.1 */
  ejection_charge_mass_kg: number;
  /** Posição do centro de massa do conjunto de recuperação ao longo do eixo
   * do foguete (m). -10.0 <= center_of_mass_m <= 10.0 */
  center_of_mass_m: number;
  /** Velocidade terminal prevista (m/s). 0 < predicted_terminal_velocity_m_s <= 50.0 */
  predicted_terminal_velocity_m_s: number;
  /** Tempo de ativação do drogue após o apogeu (s). Aplicável apenas se
   * `has_drogue=true`. 0 <= drogue_deployment_time_s <= 60.0 */
  drogue_deployment_time_s: number | null;
  /** Coeficiente de arrasto (Cd) do paraquedas drogue. Aplicável apenas se
   * `has_drogue=true`. 0 < drogue_drag_coefficient <= 2.0 */
  drogue_drag_coefficient: number | null;
  /** Diâmetro do paraquedas drogue (m). Aplicável apenas se `has_drogue=true`.
   * 0 < drogue_diameter_m <= 5.0 */
  drogue_diameter_m: number | null;
  /** Tempo de ativação do main após o apogeu (s). 0 <= main_deployment_time_s <= 300.0 */
  main_deployment_time_s: number;
  /** Coeficiente de arrasto (Cd) do paraquedas main. 0 < main_drag_coefficient <= 2.0 */
  main_drag_coefficient: number;
  /** Diâmetro do paraquedas main (m). 0 < main_diameter_m <= 10.0 */
  main_diameter_m: number;
  /** Raio de busca previsto (m). 0 < predicted_search_radius_m <= 20000.0 */
  predicted_search_radius_m: number;
}
