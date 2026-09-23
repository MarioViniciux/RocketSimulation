import { SimulationKpis } from "@/components/results/SimulationKpis";
import { TimeSeriesLineChart } from "@/components/results/TimeSeriesLineChart";
import type { SimulationResult } from "@/types";

// Estado local sem setter: ainda não há como disparar uma simulação pela
// UI (isso é a Fase 9 - conectar o fluxo completo, incluindo a chamada a
// POST /simulate). Por ora, este componente só precisa saber renderizar
// os KPIs a partir de um SimulationResult real, e o estado vazio.
const simulationResult: SimulationResult | null = null;

export function ResultsPanel() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Resultados</h2>
        <p className="max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
          Dashboard com os KPIs da simulação (apogeu, margem de estabilidade, velocidade(s)
          terminal(is), tempo de queima) e os gráficos de altitude, velocidade e aceleração
          vertical ao longo do tempo.
        </p>
      </div>

      {simulationResult ? (
        <>
          <SimulationKpis result={simulationResult} />
          <TimeSeriesLineChart
            title="Altitude"
            unit="m"
            times={simulationResult.time_series.times_s}
            values={simulationResult.time_series.altitudes_m}
            peakLabel="Apogeu"
          />
          {/* Velocidade e aceleração em gráficos separados, não um único
           * gráfico de eixo duplo: unidades (m/s vs m/s²) e escalas
           * diferentes tornariam qualquer alinhamento entre as duas
           * curvas arbitrário — ver skill de visualização de dados,
           * anti-padrão "dual-axis charts". */}
          <TimeSeriesLineChart
            title="Velocidade Vertical"
            unit="m/s"
            times={simulationResult.time_series.times_s}
            values={simulationResult.time_series.vertical_velocities_m_s}
          />
          <TimeSeriesLineChart
            title="Aceleração Vertical"
            unit="m/s²"
            times={simulationResult.time_series.times_s}
            values={simulationResult.time_series.vertical_accelerations_m_s2}
          />
        </>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Ainda não há uma simulação executada. A chamada a{" "}
          <code className="font-mono">POST /simulate</code> a partir dos formulários será
          conectada na Fase 9.
        </p>
      )}
    </div>
  );
}
