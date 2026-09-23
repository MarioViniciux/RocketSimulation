import { z } from "zod";
import { NoseConeShape } from "@/types";
import { integerField, numberField } from "./number-field";

const noseConeShapeSchema = z.enum([
  NoseConeShape.OGIVAL,
  NoseConeShape.PARABOLIC,
  NoseConeShape.CONICAL,
]);

export const noseConeSchema = z.object({
  shape: noseConeShapeSchema,
  length_m: numberField({ gt: 0, le: 2.0 }, "m"),
  mass_kg: numberField({ gt: 0, le: 20.0 }, "kg"),
});

export const finsSchema = z.object({
  count: integerField({ ge: 1, le: 8 }, "un"),
  mounting_angle_deg: numberField({ ge: -15.0, le: 15.0 }, "graus"),
  root_chord_m: numberField({ gt: 0, le: 1.0 }, "m"),
  tip_chord_m: numberField({ ge: 0, le: 1.0 }, "m"),
  semispan_m: numberField({ gt: 0, le: 0.5 }, "m"),
  mid_chord_sweep_m: numberField({ ge: 0, le: 1.0 }, "m"),
  root_leading_edge_position_m: numberField({ ge: 0, le: 10.0 }, "m"),
});

export const railButtonsSchema = z.object({
  count: integerField({ ge: 1, le: 6 }, "un"),
  angle_deg: numberField({ ge: 0.0, le: 360.0 }, "graus"),
});

export const structureSchema = z.object({
  empty_mass_kg: numberField({ gt: 0, le: 100.0 }, "kg"),
  total_length_m: numberField({ gt: 0, le: 10.0 }, "m"),
  body_diameter_m: numberField({ gt: 0, le: 0.5 }, "m"),
  center_of_mass_m: numberField({ ge: -10.0, le: 10.0 }, "m"),
  drag_coefficient: numberField({ gt: 0, le: 2.0 }, ""),
  nose_cone: noseConeSchema,
  fins: finsSchema,
  rail_buttons: railButtonsSchema,
});
