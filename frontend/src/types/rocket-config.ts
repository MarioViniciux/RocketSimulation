/** Espelha `app/schemas.py` do backend. */

import type { Avionics } from "./avionics";
import type { Environment } from "./environment";
import type { Payload } from "./payload";
import type { Propulsion } from "./propulsion";
import type { Recovery } from "./recovery";
import type { Structure } from "./structure";

/** Payload de entrada agregando todos os módulos do foguete, enviado ao
 * backend em `POST /simulate`. */
export interface RocketConfig {
  propulsion: Propulsion;
  avionics: Avionics;
  payload: Payload;
  structure: Structure;
  recovery: Recovery;
  environment: Environment;
}
