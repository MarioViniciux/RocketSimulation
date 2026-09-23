"use client";

import { useId, useMemo, useState } from "react";
import { downsampleSeries } from "@/lib/downsample-series";
import { formatMeasurement } from "@/lib/format-measurement";
import { niceTicks } from "@/lib/nice-ticks";

const VIEW_WIDTH = 640;
const VIEW_HEIGHT = 260;
const PADDING = { top: 16, right: 16, bottom: 32, left: 56 };
const MAX_POINTS = 300;
const Y_TICK_COUNT = 4;
const X_TICK_COUNT = 5;

const PLOT_WIDTH = VIEW_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = VIEW_HEIGHT - PADDING.top - PADDING.bottom;

interface TimeSeriesLineChartProps {
  /** Título do gráfico — também serve de rótulo da série (série única,
   * então não precisa de legenda: ver skill de visualização de dados). */
  title: string;
  /** Unidade do valor (eixo Y e tooltip), ex.: "m", "m/s", "m/s²". */
  unit: string;
  times: readonly number[];
  values: readonly number[];
  /** Rótulo do ponto de valor máximo (ex.: "Apogeu"); omitido se não fizer
   * sentido destacar o extremo dessa série. */
  peakLabel?: string;
  valueFractionDigits?: number;
}

/** Gráfico de linha de uma série temporal única (ex.: altitude, aceleração
 * ou velocidade vertical ao longo do tempo), em SVG puro e declarativo:
 * eixos com números limpos, crosshair + tooltip ao passar o mouse (ou
 * pelo teclado, com as setas), rótulo direto no extremo e uma vista em
 * tabela como par acessível equivalente (ver skill de visualização de
 * dados, `references/interaction.md` e `marks-and-anatomy.md`).
 *
 * A vista em tabela usa a mesma série reduzida (`downsampleSeries`) do
 * gráfico, não as dezenas de milhares de amostras brutas da simulação —
 * o par acessível é do que é mostrado no gráfico, não uma tabela
 * impraticável de rolar. */
export function TimeSeriesLineChart({
  title,
  unit,
  times,
  values,
  peakLabel,
  valueFractionDigits = 1,
}: TimeSeriesLineChartProps) {
  const gradientId = useId();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const points = useMemo(() => downsampleSeries(times, values, MAX_POINTS), [times, values]);

  const tMin = points[0]?.t ?? 0;
  const tMax = points[points.length - 1]?.t ?? 1;
  const rawValueMin = Math.min(0, ...points.map((p) => p.value));
  const rawValueMax = Math.max(...points.map((p) => p.value));
  const valueMax = rawValueMax > 0 ? rawValueMax * 1.08 : rawValueMax + 1;
  const valueMin = rawValueMin < 0 ? rawValueMin * 1.08 : rawValueMin;

  const xScale = (t: number): number =>
    PADDING.left + ((t - tMin) / (tMax - tMin || 1)) * PLOT_WIDTH;
  const yScale = (value: number): number =>
    PADDING.top + (1 - (value - valueMin) / (valueMax - valueMin || 1)) * PLOT_HEIGHT;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.t).toFixed(2)} ${yScale(p.value).toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L ${xScale(tMax).toFixed(2)} ${(PADDING.top + PLOT_HEIGHT).toFixed(2)} L ${xScale(tMin).toFixed(2)} ${(PADDING.top + PLOT_HEIGHT).toFixed(2)} Z`;

  const yTicks = niceTicks(valueMin, valueMax, Y_TICK_COUNT);
  const xTicks = niceTicks(tMin, tMax, X_TICK_COUNT);

  const peakIndex = points.reduce(
    (best, p, i) => (p.value > points[best].value ? i : best),
    0,
  );

  function nearestIndexAtClientX(clientX: number, svg: SVGSVGElement): number {
    const rect = svg.getBoundingClientRect();
    const relativeX = ((clientX - rect.left) / rect.width) * VIEW_WIDTH;
    const t = tMin + ((relativeX - PADDING.left) / PLOT_WIDTH) * (tMax - tMin);
    let nearest = 0;
    let nearestDistance = Infinity;
    points.forEach((p, i) => {
      const distance = Math.abs(p.t - t);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = i;
      }
    });
    return nearest;
  }

  const active = activeIndex !== null ? points[activeIndex] : null;

  return (
    <div className="chart-viz flex flex-col gap-2">
      <style>{`
        .chart-viz {
          --chart-series: #2a78d6;
          --chart-grid: #e1e0d9;
          --chart-axis: #c3c2b7;
          --chart-muted: #898781;
          --chart-secondary: #52514e;
        }
        @media (prefers-color-scheme: dark) {
          .chart-viz {
            --chart-series: #3987e5;
            --chart-grid: #2c2c2a;
            --chart-axis: #383835;
            --chart-muted: #898781;
            --chart-secondary: #c3c2b7;
          }
        }
      `}</style>

      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          type="button"
          onClick={() => setShowTable((current) => !current)}
          className="text-xs text-zinc-500 underline hover:text-foreground dark:text-zinc-400"
        >
          {showTable ? "Ver gráfico" : "Ver como tabela"}
        </button>
      </div>

      {showTable ? (
        <div className="max-h-64 overflow-y-auto rounded border border-black/10 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-[var(--background)]">
              <tr className="border-b border-black/10 dark:border-white/10">
                <th scope="col" className="px-3 py-2 font-medium tabular-nums">
                  Tempo (s)
                </th>
                <th scope="col" className="px-3 py-2 font-medium tabular-nums">
                  {title} ({unit})
                </th>
              </tr>
            </thead>
            <tbody>
              {points.map((p, i) => (
                <tr key={i} className="border-b border-black/5 last:border-0 dark:border-white/5">
                  <td className="px-3 py-1 tabular-nums">{p.t.toFixed(2)}</td>
                  <td className="px-3 py-1 tabular-nums">{p.value.toFixed(valueFractionDigits)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative w-full" style={{ aspectRatio: `${VIEW_WIDTH} / ${VIEW_HEIGHT}` }}>
          <svg
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label={`${title} ao longo do tempo`}
            tabIndex={0}
            onPointerMove={(event) => {
              setActiveIndex(nearestIndexAtClientX(event.clientX, event.currentTarget));
            }}
            onPointerLeave={() => setActiveIndex(null)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                setActiveIndex((current) => Math.min((current ?? -1) + 1, points.length - 1));
              } else if (event.key === "ArrowLeft") {
                setActiveIndex((current) => Math.max((current ?? points.length) - 1, 0));
              }
            }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-series)" stopOpacity={0.12} />
                <stop offset="100%" stopColor="var(--chart-series)" stopOpacity={0} />
              </linearGradient>
            </defs>

            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PADDING.left}
                  x2={VIEW_WIDTH - PADDING.right}
                  y1={yScale(tick)}
                  y2={yScale(tick)}
                  stroke="var(--chart-grid)"
                  strokeWidth={1}
                />
                <text
                  x={PADDING.left - 8}
                  y={yScale(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={11}
                  fill="var(--chart-muted)"
                >
                  {tick.toLocaleString("pt-BR")}
                </text>
              </g>
            ))}

            <line
              x1={PADDING.left}
              x2={VIEW_WIDTH - PADDING.right}
              y1={PADDING.top + PLOT_HEIGHT}
              y2={PADDING.top + PLOT_HEIGHT}
              stroke="var(--chart-axis)"
              strokeWidth={1}
            />
            {xTicks.map((tick) => (
              <text
                key={tick}
                x={xScale(tick)}
                y={PADDING.top + PLOT_HEIGHT + 20}
                textAnchor="middle"
                fontSize={11}
                fill="var(--chart-muted)"
              >
                {tick.toLocaleString("pt-BR")}
              </text>
            ))}

            <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
            <path
              d={linePath}
              fill="none"
              stroke="var(--chart-series)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {peakLabel ? (
              <g>
                <circle
                  cx={xScale(points[peakIndex].t)}
                  cy={yScale(points[peakIndex].value)}
                  r={4}
                  fill="var(--chart-series)"
                  stroke="var(--background)"
                  strokeWidth={2}
                />
                <text
                  x={xScale(points[peakIndex].t)}
                  y={yScale(points[peakIndex].value) - 10}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--chart-secondary)"
                >
                  {peakLabel}: {formatMeasurement(points[peakIndex].value, unit, valueFractionDigits)}
                </text>
              </g>
            ) : null}

            {active ? (
              <line
                x1={xScale(active.t)}
                x2={xScale(active.t)}
                y1={PADDING.top}
                y2={PADDING.top + PLOT_HEIGHT}
                stroke="var(--chart-axis)"
                strokeWidth={1}
              />
            ) : null}
          </svg>

          {active ? (
            <div
              className="pointer-events-none absolute rounded border border-black/10 bg-[var(--background)] px-2 py-1 text-xs shadow-sm dark:border-white/10"
              style={{
                left: `${(xScale(active.t) / VIEW_WIDTH) * 100}%`,
                top: `${(yScale(active.value) / VIEW_HEIGHT) * 100}%`,
                transform: "translate(-50%, -120%)",
              }}
            >
              <div className="font-semibold">{formatMeasurement(active.value, unit, valueFractionDigits)}</div>
              <div className="text-zinc-500 dark:text-zinc-400">t = {active.t.toFixed(2)} s</div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
