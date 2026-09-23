import { z } from "zod";

interface NumberBounds {
  gt?: number;
  ge?: number;
  lt?: number;
  le?: number;
}

function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 6 });
}

function withUnit(value: number, unit: string): string {
  return unit ? `${formatNumber(value)} ${unit}` : formatNumber(value);
}

/** Descrição da faixa válida completa (ex.: "maior que 0 e no máximo 2 m",
 * "entre -10 e 10 m"), usada em todas as mensagens de limite do campo: ao
 * violar qualquer um dos limites, o usuário vê de uma vez o intervalo
 * aceito, em vez de descobrir o outro limite só na próxima tentativa. */
export function describeRange(bounds: NumberBounds, unit: string): string {
  const { gt, ge, lt, le } = bounds;
  if (ge !== undefined && le !== undefined) {
    return `entre ${formatNumber(ge)} e ${withUnit(le, unit)}`;
  }

  const lower =
    gt !== undefined
      ? `maior que ${formatNumber(gt)}`
      : ge !== undefined
        ? `no mínimo ${formatNumber(ge)}`
        : undefined;
  const upper =
    lt !== undefined
      ? `menor que ${withUnit(lt, unit)}`
      : le !== undefined
        ? `no máximo ${withUnit(le, unit)}`
        : undefined;

  if (lower && upper) {
    return `${lower} e ${upper}`;
  }
  if (lower) {
    return unit ? `${lower} ${unit}` : lower;
  }
  return upper ?? "";
}

/** Constrói um `z.ZodNumber` com os mesmos limites (`gt`/`ge`/`lt`/`le`) dos
 * `Field(...)` do Pydantic no backend, com mensagens de erro em português
 * (números em pt-BR) indicando a faixa válida completa e a unidade SI do
 * campo. */
export function numberField(bounds: NumberBounds, unit: string): z.ZodNumber {
  const rangeMessage = `Valor fora da faixa: deve ser ${describeRange(bounds, unit)}.`;
  let schema = z.number({ error: "Campo obrigatório: informe um número." });
  if (bounds.gt !== undefined) {
    schema = schema.gt(bounds.gt, rangeMessage);
  }
  if (bounds.ge !== undefined) {
    schema = schema.gte(bounds.ge, rangeMessage);
  }
  if (bounds.lt !== undefined) {
    schema = schema.lt(bounds.lt, rangeMessage);
  }
  if (bounds.le !== undefined) {
    schema = schema.lte(bounds.le, rangeMessage);
  }
  return schema;
}

/** Como `numberField`, mas exigindo um número inteiro (ex.: contagens). */
export function integerField(bounds: NumberBounds, unit: string): z.ZodNumber {
  return numberField(bounds, unit).int("Deve ser um número inteiro (sem casas decimais).");
}
