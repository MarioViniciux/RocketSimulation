import { z } from "zod";
import { numberField } from "./number-field";

export const environmentSchema = z.object({
  latitude_deg: numberField({ ge: -90, le: 90 }, "graus"),
  longitude_deg: numberField({ ge: -180, le: 180 }, "graus"),
  elevation_m: numberField({ ge: -430.0, le: 6000.0 }, "m"),
  wind_speed_m_s: numberField({ ge: 0, le: 30.0 }, "m/s"),
  launch_rail_length_m: numberField({ gt: 0, le: 10.0 }, "m"),
  launch_rail_angle_deg: numberField({ ge: -45.0, le: 45.0 }, "graus"),
});
