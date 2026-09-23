/** Formata um valor numérico com unidade, em pt-BR (vírgula decimal),
 * para exibição nos KPIs e gráficos do dashboard de resultados. */
export function formatMeasurement(value: number, unit: string, fractionDigits = 1): string {
  const formatted = value.toLocaleString("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return `${formatted} ${unit}`;
}
