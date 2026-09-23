interface ErrorStateProps {
  message: string;
}

/** Estado de erro da chamada a `POST /simulate`: tanto erros de validação
 * do Pydantic (payload malformado) quanto `SimulationError` do backend
 * (configuração fisicamente inválida ou instável) chegam aqui já como uma
 * mensagem legível (`ApiError.message`, ver `src/lib/api/errors.ts`).
 *
 * Cor de status (crítico) sempre acompanhada de ícone + rótulo textual
 * "Erro na simulação" — nunca só a cor, conforme a skill de visualização
 * de dados. */
export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded border border-[#d03b3b]/30 bg-[#d03b3b]/5 p-4 text-sm dark:border-[#e66767]/30 dark:bg-[#e66767]/10"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="mt-0.5 h-4 w-4 shrink-0 fill-[#d03b3b] dark:fill-[#e66767]"
      >
        <path d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM9.25 6h1.5v6h-1.5V6Zm0 7.5h1.5V15h-1.5v-1.5Z" />
      </svg>
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-[#d03b3b] dark:text-[#e66767]">
          Erro na simulação
        </span>
        <span className="text-zinc-700 dark:text-zinc-300">{message}</span>
      </div>
    </div>
  );
}
