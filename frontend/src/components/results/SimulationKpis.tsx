import { formatMeasurement } from "@/lib/format-measurement";
import type { SimulationResult } from "@/types";
import { StatTile } from "./StatTile";

interface SimulationKpisProps {
  result: SimulationResult;
}

/** KPIs da simulação: apogeu, margem de estabilidade, velocidade(s)
 * terminal(is) e tempo de queima total — ver "Saídas e Resultados da
 * Simulação" no `AGENTS.md`. A tile de velocidade terminal do drogue só
 * aparece quando há drogue configurado (`drogue_terminal_velocity_m_s`
 * não nulo). */
export function SimulationKpis({ result }: SimulationKpisProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <StatTile label="Apogeu" value={formatMeasurement(result.apogee_altitude_m, "m")} />
      <StatTile
        label="Margem de estabilidade"
        value={formatMeasurement(result.stability_margin_calibers, "cal", 2)}
      />
      {result.drogue_terminal_velocity_m_s !== null ? (
        <StatTile
          label="Velocidade terminal (drogue)"
          value={formatMeasurement(result.drogue_terminal_velocity_m_s, "m/s")}
        />
      ) : null}
      <StatTile
        label="Velocidade terminal (main)"
        value={formatMeasurement(result.main_terminal_velocity_m_s, "m/s")}
      />
      <StatTile label="Tempo de queima" value={formatMeasurement(result.burn_time_s, "s")} />
    </div>
  );
}
