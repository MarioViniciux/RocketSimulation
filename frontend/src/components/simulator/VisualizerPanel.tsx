"use client";

import dynamic from "next/dynamic";

const RocketCanvas = dynamic(
  () => import("@/components/visualizer/RocketCanvas").then((mod) => mod.RocketCanvas),
  { ssr: false },
);

export function VisualizerPanel() {
  return (
    <div className="flex flex-1 flex-col gap-2 p-6">
      <h2 className="text-lg font-semibold">Visualizador</h2>
      <p className="max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
        Renderização interativa 2D/3D do foguete, atualizada a partir das dimensões, diâmetros e
        posições informadas na entrada de dados.
      </p>
      <div className="min-h-[400px] flex-1 rounded border border-black/10 dark:border-white/10">
        <RocketCanvas />
      </div>
    </div>
  );
}
