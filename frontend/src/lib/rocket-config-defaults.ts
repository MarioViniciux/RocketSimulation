import type { DefaultValues } from "react-hook-form";
import type { RocketConfig } from "@/types";

/** Valores iniciais do formulário do `RocketConfig`, preenchidos
 * incrementalmente conforme cada formulário de subsistema é criado (Fase 6).
 * Os valores replicam a configuração estável e com empuxo suficiente
 * validada em `backend/tests/api/test_simulate_endpoint.py`. */
export const ROCKET_CONFIG_DEFAULT_VALUES: DefaultValues<RocketConfig> = {
  propulsion: {
    combustion_chamber: { length_m: 0.5, diameter_m: 0.1, empty_mass_kg: 1.0 },
    propellant_grain: {
      propellant_mass_kg: 2.0,
      grain_count: 4,
      grain_diameter_m: 0.08,
      single_grain_burn_time_s: 0.75,
    },
    nozzle: { throat_diameter_m: 0.03, exit_diameter_m: 0.08, length_m: 0.1, position_m: 2.0 },
    dry_inertia: { dry_inertia_kg_m2: 0.5, dry_center_of_mass_m: 1.8 },
    thermodynamic_impulse_parameters: {
      reference_pressure_pa: 5_000_000,
      total_impulse_ns: 2000,
      pressure_impulse_ns: 50,
      exhaust_velocity_m_s: 1500,
    },
  },
  avionics: {
    mass_kg: 0.5,
    position_x_m: 0.3,
    position_y_m: 0.0,
    position_z_m: 0.0,
    diameter_m: 0.08,
    length_m: 0.15,
  },
};
