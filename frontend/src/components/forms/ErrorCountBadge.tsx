interface ErrorCountBadgeProps {
  count: number;
}

/** Selo com a quantidade de campos inválidos (não renderiza nada se zero).
 * O texto acompanha a cor, para não depender só dela. */
export function ErrorCountBadge({ count }: ErrorCountBadgeProps) {
  if (count === 0) {
    return null;
  }
  return (
    <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
      {count} {count === 1 ? "erro" : "erros"}
    </span>
  );
}
