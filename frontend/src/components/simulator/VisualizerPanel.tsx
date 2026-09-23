"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { RocketSilhouette2D } from "@/components/visualizer/RocketSilhouette2D";
import { useRocketConfigValues } from "@/lib/use-rocket-config-values";

const RocketCanvas = dynamic(
  () => import("@/components/visualizer/RocketCanvas").then((mod) => mod.RocketCanvas),
  { ssr: false },
);

const VIEW_MODES = [
  { id: "3d", label: "3D" },
  { id: "2d", label: "2D" },
] as const;

type ViewMode = (typeof VIEW_MODES)[number]["id"];

export function VisualizerPanel() {
  const [viewMode, setViewMode] = useState<ViewMode>("3d");
  const config = useRocketConfigValues();

  return (
    <div className="flex flex-1 flex-col gap-2 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Visualizador</h2>
          <p className="max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
            Renderização interativa 2D/3D do foguete, atualizada a partir das dimensões, diâmetros
            e posições informadas na entrada de dados.
          </p>
        </div>
        <div
          role="tablist"
          aria-label="Modo de visualização"
          className="flex shrink-0 overflow-hidden rounded-md border border-black/10 dark:border-white/10"
        >
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={viewMode === mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === mode.id
                  ? "bg-foreground text-background"
                  : "text-zinc-500 hover:text-foreground dark:text-zinc-400"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[400px] flex-1 rounded border border-black/10 dark:border-white/10">
        {viewMode === "3d" ? <RocketCanvas /> : <RocketSilhouette2D config={config} />}
      </div>
    </div>
  );
}
