import type { DefaultValues } from "react-hook-form";
import { NoseConeShape } from "@/types";
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
  payload: {
    mass_kg: 0.5,
    position_x_m: 0.6,
    position_y_m: 0.0,
    position_z_m: 0.0,
    diameter_m: 0.08,
    length_m: 0.15,
  },
  structure: {
    empty_mass_kg: 3.0,
    total_length_m: 2.0,
    body_diameter_m: 0.1,
    center_of_mass_m: 1.0,
    drag_coefficient: 0.45,
    nose_cone: { shape: NoseConeShape.OGIVAL, length_m: 0.3, mass_kg: 0.3 },
    fins: {
      count: 3,
      mounting_angle_deg: 0.0,
      root_chord_m: 0.15,
      tip_chord_m: 0.07,
      semispan_m: 0.08,
      mid_chord_sweep_m: 0.05,
      root_leading_edge_position_m: 1.85,
    },
    rail_buttons: { count: 2, angle_deg: 180.0 },
  },
  recovery: {
    has_drogue: false,
    lower_support_mass_kg: 0.2,
    parachutes_mass_kg: 0.3,
    piston_cap_mass_kg: 0.1,
    ejection_charge_mass_kg: 0.005,
    center_of_mass_m: 1.6,
    predicted_terminal_velocity_m_s: 6.0,
    drogue_deployment_time_s: null,
    drogue_drag_coefficient: null,
    drogue_diameter_m: null,
    main_deployment_time_s: 5.0,
    main_drag_coefficient: 1.5,
    main_diameter_m: 1.5,
    predicted_search_radius_m: 500.0,
  },
};
