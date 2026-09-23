/** Espelha `app/structure/schemas.py` do backend. */

/** Formato da coifa (mirror de `NoseConeShape`, `StrEnum` no backend). */
export const NoseConeShape = {
  OGIVAL: "ogival",
  PARABOLIC: "parabolico",
  CONICAL: "conico",
} as const;

export type NoseConeShape = (typeof NoseConeShape)[keyof typeof NoseConeShape];

/** Coifa (nose cone). */
export interface NoseCone {
  shape: NoseConeShape;
  /** Comprimento da coifa (m). 0 < length_m <= 2.0 */
  length_m: number;
  /** Massa da coifa (kg). 0 < mass_kg <= 20.0 */
  mass_kg: number;
}

/** Aletas. */
export interface Fins {
  /** Quantidade de aletas. 1 <= count <= 8 */
  count: number;
  /** Angulação de montagem (cant) das aletas (graus). -15.0 <= mounting_angle_deg <= 15.0 */
  mounting_angle_deg: number;
  /** Corda de raiz da aleta (m). 0 < root_chord_m <= 1.0 */
  root_chord_m: number;
  /** Corda de ponta da aleta (m). 0 <= tip_chord_m <= 1.0 */
  tip_chord_m: number;
  /** Envergadura (semi-span) da aleta (m). 0 < semispan_m <= 0.5 */
  semispan_m: number;
  /** Enflechamento: distância paralela ao corpo entre os bordos de ataque da
   * raiz e da ponta da aleta (m). 0 <= mid_chord_sweep_m <= 1.0 */
  mid_chord_sweep_m: number;
  /** Distância da ponta do nariz até o bordo de ataque da raiz da aleta (m).
   * 0 <= root_leading_edge_position_m <= 10.0 */
  root_leading_edge_position_m: number;
}

/** Guias de lançamento (rail buttons). */
export interface RailButtons {
  /** Quantidade de rail buttons. 1 <= count <= 6 */
  count: number;
  /** Angulação (posição angular ao redor da fuselagem) dos rail buttons
   * (graus). 0.0 <= angle_deg <= 360.0 */
  angle_deg: number;
}

/** Módulo agregador de Estrutura. */
export interface Structure {
  /** Massa da estrutura totalmente vazia, incluindo coifa (kg).
   * 0 < empty_mass_kg <= 100.0 */
  empty_mass_kg: number;
  /** Comprimento total do foguete, com coifa (m). 0 < total_length_m <= 10.0 */
  total_length_m: number;
  /** Diâmetro do corpo (fuselagem) do foguete (m). 0 < body_diameter_m <= 0.5 */
  body_diameter_m: number;
  /** Posição do centro de massa da estrutura ao longo do eixo do foguete (m).
   * -10.0 <= center_of_mass_m <= 10.0 */
  center_of_mass_m: number;
  /** Coeficiente de arrasto (Cd) de referência em baixo Número de Mach
   * (escoamento subsônico incompressível). 0 < drag_coefficient <= 2.0 */
  drag_coefficient: number;
  nose_cone: NoseCone;
  fins: Fins;
  rail_buttons: RailButtons;
}
