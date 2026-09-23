export interface SeriesPoint {
  t: number;
  value: number;
}

/** Reduz uma série temporal longa (a simulação gera dezenas de milhares
 * de amostras, com `dt_s` fixo) a no máximo `maxPoints`, mantendo o
 * formato visual: passo uniforme, sempre incluindo o primeiro, o último e
 * o índice do valor extremo (ex.: o apogeu), que uma amostragem uniforme
 * poderia pular. Suficiente para um gráfico "leve e fluido" — não
 * pretende ser uma redução estatisticamente ótima (tipo LTTB). */
export function downsampleSeries(
  times: readonly number[],
  values: readonly number[],
  maxPoints: number,
): SeriesPoint[] {
  const length = Math.min(times.length, values.length);
  if (length <= maxPoints) {
    return Array.from({ length }, (_, i) => ({ t: times[i], value: values[i] }));
  }

  let extremeIndex = 0;
  for (let i = 1; i < length; i++) {
    if (Math.abs(values[i]) > Math.abs(values[extremeIndex])) {
      extremeIndex = i;
    }
  }

  const indices = new Set<number>([0, length - 1, extremeIndex]);
  const step = (length - 1) / (maxPoints - 1);
  for (let i = 0; i < maxPoints; i++) {
    indices.add(Math.round(i * step));
  }

  return Array.from(indices)
    .sort((a, b) => a - b)
    .map((i) => ({ t: times[i], value: values[i] }));
}
