import { SimulationKpis } from "@/components/results/SimulationKpis";
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
        <SimulationKpis result={simulationResult} />
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
