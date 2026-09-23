interface StatTileProps {
  label: string;
  value: string;
}

/** Tile de estatística: `label` (minúsculo, sem dois-pontos) e `value`
 * (já formatado, incluindo a unidade). Fonte proporcional (não tabular),
 * por ser um número isolado de destaque, não uma coluna alinhada — ver a
 * skill de visualização de dados (`references/marks-and-anatomy.md`,
 * contrato de "stat tile"). */
export function StatTile({ label, value }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded border border-black/10 p-4 dark:border-white/10">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-2xl font-semibold">{value}</span>
    </div>
  );
}
