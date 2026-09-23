/** Gera ~`count` valores de tique "redondos" (1/2/5 × potência de 10)
 * cobrindo `[min, max]`, no estilo D3 `ticks`/`nice` — para eixos de
 * gráfico com números limpos em vez dos limites exatos dos dados. */
export function niceTicks(min: number, max: number, count: number): number[] {
  if (min === max) {
    return [min];
  }
  const span = niceNumber(max - min, false);
  const step = niceNumber(span / Math.max(count - 1, 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;

  const ticks: number[] = [];
  for (let value = niceMin; value <= niceMax + step / 2; value += step) {
    ticks.push(Math.round(value / step) * step);
  }
  return ticks;
}

function niceNumber(value: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / 10 ** exponent;
  let niceFraction: number;

  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }

  return niceFraction * 10 ** exponent;
}
