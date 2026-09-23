import { z } from "zod";

interface NumberBounds {
  gt?: number;
  ge?: number;
  lt?: number;
  le?: number;
}

function withUnit(text: string, unit: string): string {
  return unit ? `${text} ${unit}.` : `${text}.`;
}

/** Constrói um `z.ZodNumber` com os mesmos limites (`gt`/`ge`/`lt`/`le`) dos
 * `Field(...)` do Pydantic no backend, com mensagens de erro em português
 * incluindo a unidade SI do campo. */
export function numberField(bounds: NumberBounds, unit: string): z.ZodNumber {
  let schema = z.number({ error: "Informe um número." });
  if (bounds.gt !== undefined) {
    schema = schema.gt(bounds.gt, withUnit(`Deve ser maior que ${bounds.gt}`, unit));
  }
  if (bounds.ge !== undefined) {
    schema = schema.gte(bounds.ge, withUnit(`Deve ser maior ou igual a ${bounds.ge}`, unit));
  }
  if (bounds.lt !== undefined) {
    schema = schema.lt(bounds.lt, withUnit(`Deve ser menor que ${bounds.lt}`, unit));
  }
  if (bounds.le !== undefined) {
    schema = schema.lte(bounds.le, withUnit(`Deve ser menor ou igual a ${bounds.le}`, unit));
  }
  return schema;
}

/** Como `numberField`, mas exigindo um número inteiro (ex.: contagens). */
export function integerField(bounds: NumberBounds, unit: string): z.ZodNumber {
  return numberField(bounds, unit).int("Deve ser um número inteiro.");
}
