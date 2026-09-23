/** Estado de carregamento durante a chamada a `POST /simulate`. */
export function LoadingState() {
  return (
    <div className="flex items-center gap-3 rounded border border-black/10 p-4 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-400">
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      />
      <span>Simulando o voo do foguete…</span>
    </div>
  );
}
