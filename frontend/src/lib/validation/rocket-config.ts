import { z } from "zod";
import { avionicsSchema } from "./avionics";
import { environmentSchema } from "./environment";
import { payloadSchema } from "./payload";
import { propulsionSchema } from "./propulsion";
import { recoverySchema } from "./recovery";
import { structureSchema } from "./structure";

/** Espelha `RocketConfig` (`app/schemas.py` no backend) e os limites de cada
 * `Field(...)` dos schemas Pydantic dos módulos, para validação client-side
 * consistente com o backend antes de enviar a configuração para
 * `POST /simulate`. */
export const rocketConfigSchema = z.object({
  propulsion: propulsionSchema,
  avionics: avionicsSchema,
  payload: payloadSchema,
  structure: structureSchema,
  recovery: recoverySchema,
  environment: environmentSchema,
});
