export function InputPanel() {
  return (
    <div className="flex flex-1 flex-col gap-2 p-6">
      <h2 className="text-lg font-semibold">Entrada de Dados</h2>
      <p className="max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
        Formulários por subsistema (Propulsão, Aviônica, Payload, Estrutura, Recuperação,
        Ambiente) que compõem o <code className="font-mono">RocketConfig</code> enviado para a
        simulação.
      </p>
    </div>
  );
}
