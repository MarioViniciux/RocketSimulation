export function ResultsPanel() {
  return (
    <div className="flex flex-1 flex-col gap-2 p-6">
      <h2 className="text-lg font-semibold">Resultados</h2>
      <p className="max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
        Dashboard com os KPIs da simulação (apogeu, margem de estabilidade, velocidade(s)
        terminal(is), tempo de queima) e os gráficos de altitude, velocidade e aceleração
        vertical ao longo do tempo.
      </p>
    </div>
  );
}
