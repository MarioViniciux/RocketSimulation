import { z } from "zod";
import { numberField } from "./number-field";

const baseRecoverySchema = z.object({
  has_drogue: z.boolean(),
  lower_support_mass_kg: numberField({ gt: 0, le: 10.0 }, "kg"),
  parachutes_mass_kg: numberField({ gt: 0, le: 10.0 }, "kg"),
  piston_cap_mass_kg: numberField({ gt: 0, le: 5.0 }, "kg"),
  ejection_charge_mass_kg: numberField({ gt: 0, le: 0.1 }, "kg"),
  center_of_mass_m: numberField({ ge: -10.0, le: 10.0 }, "m"),
  predicted_terminal_velocity_m_s: numberField({ gt: 0, le: 50.0 }, "m/s"),
  drogue_deployment_time_s: numberField({ ge: 0, le: 60.0 }, "s").nullable(),
  drogue_drag_coefficient: numberField({ gt: 0, le: 2.0 }, "").nullable(),
  drogue_diameter_m: numberField({ gt: 0, le: 5.0 }, "m").nullable(),
  main_deployment_time_s: numberField({ ge: 0, le: 300.0 }, "s"),
  main_drag_coefficient: numberField({ gt: 0, le: 2.0 }, ""),
  main_diameter_m: numberField({ gt: 0, le: 10.0 }, "m"),
  predicted_search_radius_m: numberField({ gt: 0, le: 20000.0 }, "m"),
});

/** Espelha `validate_drogue_fields` de `app/recovery/schemas.py` no backend:
 * os campos do drogue são obrigatórios quando `has_drogue=true` e devem
 * ficar `null` quando `has_drogue=false`. */
export const recoverySchema = baseRecoverySchema.superRefine((recovery, ctx) => {
  const drogueFields = [
    ["drogue_deployment_time_s", recovery.drogue_deployment_time_s],
    ["drogue_drag_coefficient", recovery.drogue_drag_coefficient],
    ["drogue_diameter_m", recovery.drogue_diameter_m],
  ] as const;

  for (const [field, value] of drogueFields) {
    if (recovery.has_drogue && value === null) {
      ctx.addIssue({
        code: "custom",
        path: [field],
        message: "Obrigatório quando o drogue está habilitado.",
      });
    }
    if (!recovery.has_drogue && value !== null) {
      ctx.addIssue({
        code: "custom",
        path: [field],
        message: "Deve ficar vazio quando não há drogue.",
      });
    }
  }
});
