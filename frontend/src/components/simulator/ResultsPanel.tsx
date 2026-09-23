"use client";

import { ErrorState } from "@/components/results/ErrorState";
import { LoadingState } from "@/components/results/LoadingState";
import { SimulationKpis } from "@/components/results/SimulationKpis";
import { TimeSeriesLineChart } from "@/components/results/TimeSeriesLineChart";
import { useSimulation } from "./SimulationProvider";

export function ResultsPanel() {
  const { state } = useSimulation();

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

      {state.status === "loading" ? <LoadingState /> : null}
      {state.status === "error" ? <ErrorState message={state.message} /> : null}
      {state.status === "idle" ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Ainda não há uma simulação executada. Preencha os formulários na aba{" "}
          <span className="font-medium">Entrada de Dados</span> e clique em{" "}
          <span className="font-medium">Executar Simulação</span>.
        </p>
      ) : null}
      {state.status === "success" ? (
        <>
          <SimulationKpis result={state.result} />
          {/* Velocidade e aceleração em gráficos separados, não um único
           * gráfico de eixo duplo: unidades (m/s vs m/s²) e escalas
           * diferentes tornariam qualquer alinhamento entre as duas
           * curvas arbitrário — ver skill de visualização de dados,
           * anti-padrão "dual-axis charts". */}
          <TimeSeriesLineChart
            title="Altitude"
            unit="m"
            times={state.result.time_series.times_s}
            values={state.result.time_series.altitudes_m}
            peakLabel="Apogeu"
          />
          <TimeSeriesLineChart
            title="Velocidade Vertical"
            unit="m/s"
            times={state.result.time_series.times_s}
            values={state.result.time_series.vertical_velocities_m_s}
          />
          <TimeSeriesLineChart
            title="Aceleração Vertical"
            unit="m/s²"
            times={state.result.time_series.times_s}
            values={state.result.time_series.vertical_accelerations_m_s2}
          />
        </>
      ) : null}
    </div>
  );
}
