import { z } from "zod";
import { integerField, numberField } from "./number-field";

export const combustionChamberSchema = z.object({
  length_m: numberField({ gt: 0, le: 2.0 }, "m"),
  diameter_m: numberField({ gt: 0, le: 0.5 }, "m"),
  empty_mass_kg: numberField({ gt: 0, le: 50.0 }, "kg"),
});

export const propellantGrainSchema = z.object({
  propellant_mass_kg: numberField({ gt: 0, le: 50.0 }, "kg"),
  grain_count: integerField({ ge: 1, le: 20 }, "un"),
  grain_diameter_m: numberField({ gt: 0, le: 0.5 }, "m"),
  single_grain_burn_time_s: numberField({ gt: 0, le: 30.0 }, "s"),
});

export const nozzleSchema = z.object({
  throat_diameter_m: numberField({ gt: 0, le: 0.3 }, "m"),
  exit_diameter_m: numberField({ gt: 0, le: 0.5 }, "m"),
  length_m: numberField({ gt: 0, le: 1.0 }, "m"),
  position_m: numberField({ ge: -5.0, le: 5.0 }, "m"),
});

export const dryInertiaSchema = z.object({
  dry_inertia_kg_m2: numberField({ gt: 0, le: 50.0 }, "kg·m²"),
  dry_center_of_mass_m: numberField({ ge: -5.0, le: 5.0 }, "m"),
});

export const thermodynamicImpulseParametersSchema = z.object({
  reference_pressure_pa: numberField({ gt: 0, le: 2.0e7 }, "Pa"),
  total_impulse_ns: numberField({ gt: 0, le: 1.0e5 }, "N·s"),
  pressure_impulse_ns: numberField({ gt: 0, le: 5000.0 }, "N·s"),
  exhaust_velocity_m_s: numberField({ gt: 0, le: 3000.0 }, "m/s"),
});

export const propulsionSchema = z.object({
  combustion_chamber: combustionChamberSchema,
  propellant_grain: propellantGrainSchema,
  nozzle: nozzleSchema,
  dry_inertia: dryInertiaSchema,
  thermodynamic_impulse_parameters: thermodynamicImpulseParametersSchema,
});
