import { z } from "zod";
import { numberField } from "./number-field";

export const payloadSchema = z.object({
  mass_kg: numberField({ gt: 0, le: 50.0 }, "kg"),
  position_x_m: numberField({ ge: -10.0, le: 10.0 }, "m"),
  position_y_m: numberField({ ge: -10.0, le: 10.0 }, "m"),
  position_z_m: numberField({ ge: -10.0, le: 10.0 }, "m"),
  diameter_m: numberField({ gt: 0, le: 0.5 }, "m"),
  length_m: numberField({ gt: 0, le: 2.0 }, "m"),
});
