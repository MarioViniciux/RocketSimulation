/** Espelha `app/propulsion/schemas.py` do backend. */

/** Câmara de combustão do motor. */
export interface CombustionChamber {
  /** Comprimento da câmara (m). 0 < length_m <= 2.0 */
  length_m: number;
  /** Diâmetro da câmara (m). 0 < diameter_m <= 0.5 */
  diameter_m: number;
  /** Massa da câmara vazia (kg). 0 < empty_mass_kg <= 50.0 */
  empty_mass_kg: number;
}

/** Grão propelente. */
export interface PropellantGrain {
  /** Massa total do propelente (kg). 0 < propellant_mass_kg <= 50.0 */
  propellant_mass_kg: number;
  /** Quantidade de grãos. 1 <= grain_count <= 20 */
  grain_count: number;
  /** Diâmetro de um grão (m). 0 < grain_diameter_m <= 0.5 */
  grain_diameter_m: number;
  /** Tempo de queima de um único grão (s). 0 < single_grain_burn_time_s <= 30.0 */
  single_grain_burn_time_s: number;
}

/** Bocal convergente-divergente. */
export interface Nozzle {
  /** Diâmetro da garganta (m). 0 < throat_diameter_m <= 0.3 */
  throat_diameter_m: number;
  /** Diâmetro de saída (m). 0 < exit_diameter_m <= 0.5 */
  exit_diameter_m: number;
  /** Comprimento do bocal (m). 0 < length_m <= 1.0 */
  length_m: number;
  /** Posição do bocal ao longo do eixo do motor (m). -5.0 <= position_m <= 5.0 */
  position_m: number;
}

/** Inércia e massa a seco do motor. */
export interface DryInertia {
  /** Inércia seca em torno do eixo transversal (kg·m²). 0 < dry_inertia_kg_m2 <= 50.0 */
  dry_inertia_kg_m2: number;
  /** Posição do centro de massa seco (CM_seco) (m). -5.0 <= dry_center_of_mass_m <= 5.0 */
  dry_center_of_mass_m: number;
}

/** Parâmetros termodinâmicos e de impulso do motor. */
export interface ThermodynamicImpulseParameters {
  /** Pressão de referência da câmara (Pa). 0 < reference_pressure_pa <= 2.0e7 */
  reference_pressure_pa: number;
  /** Impulso total do motor (N·s). 0 < total_impulse_ns <= 1.0e5 */
  total_impulse_ns: number;
  /** Impulso de pressão (N·s). 0 < pressure_impulse_ns <= 5000.0 */
  pressure_impulse_ns: number;
  /** Velocidade de exaustão dos gases (m/s). 0 < exhaust_velocity_m_s <= 3000.0 */
  exhaust_velocity_m_s: number;
}

/** Módulo agregador de Propulsão. */
export interface Propulsion {
  combustion_chamber: CombustionChamber;
  propellant_grain: PropellantGrain;
  nozzle: Nozzle;
  dry_inertia: DryInertia;
  thermodynamic_impulse_parameters: ThermodynamicImpulseParameters;
}
