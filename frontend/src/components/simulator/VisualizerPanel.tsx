"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { RocketCanvasErrorBoundary } from "@/components/visualizer/RocketCanvasErrorBoundary";
import { RocketSilhouette2D } from "@/components/visualizer/RocketSilhouette2D";
import { useRocketConfigValues } from "@/lib/use-rocket-config-values";
import { useWebGLSupport } from "@/lib/webgl-support";

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
  const [webglRuntimeFailure, setWebglRuntimeFailure] = useState(false);
  const webglSupported = useWebGLSupport();
  const config = useRocketConfigValues();

  // `webglSupported === false` (suporte já confirmado ausente) ou uma
  // falha em tempo de execução na montagem do Canvas (ver
  // RocketCanvasErrorBoundary) — em ambos os casos, o 3D fica
  // indisponível, independentemente da preferência guardada em
  // `viewMode`.
  const canUse3D = webglSupported && !webglRuntimeFailure;
  const effectiveViewMode: ViewMode = canUse3D ? viewMode : "2d";

  return (
    <div className="flex flex-1 flex-col gap-2 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Visualizador</h2>
          <p className="max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
            Renderização interativa 2D/3D do foguete, atualizada a partir das dimensões, diâmetros
            e posições informadas na entrada de dados.
          </p>
          {!canUse3D ? (
            <p className="max-w-prose text-xs text-amber-600 dark:text-amber-500">
              Seu navegador não suporta WebGL (ou a renderização 3D falhou); usando o modo 2D.
            </p>
          ) : null}
        </div>
        <div
          role="tablist"
          aria-label="Modo de visualização"
          className="flex shrink-0 overflow-hidden rounded-md border border-black/10 dark:border-white/10"
        >
          {VIEW_MODES.map((mode) => {
            const disabled = mode.id === "3d" && !canUse3D;
            return (
              <button
                key={mode.id}
                type="button"
                role="tab"
                aria-selected={effectiveViewMode === mode.id}
                disabled={disabled}
                onClick={() => setViewMode(mode.id)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  effectiveViewMode === mode.id
                    ? "bg-foreground text-background"
                    : "text-zinc-500 hover:text-foreground dark:text-zinc-400"
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-[400px] flex-1 rounded border border-black/10 dark:border-white/10">
        {effectiveViewMode === "3d" ? (
          <RocketCanvasErrorBoundary
            fallback={<RocketSilhouette2D config={config} />}
            onError={() => setWebglRuntimeFailure(true)}
          >
            <RocketCanvas />
          </RocketCanvasErrorBoundary>
        ) : (
          <RocketSilhouette2D config={config} />
        )}
      </div>
    </div>
  );
}
