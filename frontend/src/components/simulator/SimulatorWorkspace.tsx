"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ROCKET_CONFIG_DEFAULT_VALUES } from "@/lib/rocket-config-defaults";
import { rocketConfigSchema } from "@/lib/validation";
import type { RocketConfig } from "@/types";
import { InputPanel } from "./InputPanel";
import { ResultsPanel } from "./ResultsPanel";
import { VisualizerPanel } from "./VisualizerPanel";

const TABS = [
  { id: "input", label: "Entrada de Dados" },
  { id: "visualizer", label: "Visualizador" },
  { id: "results", label: "Resultados" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Workspace principal do simulador: entrada de dados, visualizador e
 * dashboard de resultados como abas de uma única página, compartilhando o
 * mesmo estado (sem navegação/recarregamento entre elas). Os painéis
 * permanecem montados (ocultos via `hidden`, não desmontados) para que o
 * visualizador 2D/3D preserve seu estado ao trocar de aba. */
export function SimulatorWorkspace() {
  const [activeTab, setActiveTab] = useState<TabId>("input");
  const formMethods = useForm<RocketConfig>({
    defaultValues: ROCKET_CONFIG_DEFAULT_VALUES,
    resolver: zodResolver(rocketConfigSchema),
    mode: "onBlur",
  });

  return (
    <FormProvider {...formMethods}>
      <div className="flex flex-1 flex-col">
        <div
          role="tablist"
          aria-label="Etapas do simulador"
          className="flex border-b border-black/10 dark:border-white/10"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-zinc-500 hover:text-foreground dark:text-zinc-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col">
          <section
            role="tabpanel"
            id="panel-input"
            aria-labelledby="tab-input"
            hidden={activeTab !== "input"}
            className="flex flex-1 flex-col"
          >
            <InputPanel />
          </section>
          <section
            role="tabpanel"
            id="panel-visualizer"
            aria-labelledby="tab-visualizer"
            hidden={activeTab !== "visualizer"}
            className="flex flex-1 flex-col"
          >
            <VisualizerPanel />
          </section>
          <section
            role="tabpanel"
            id="panel-results"
            aria-labelledby="tab-results"
            hidden={activeTab !== "results"}
            className="flex flex-1 flex-col"
          >
            <ResultsPanel />
          </section>
        </div>
      </div>
    </FormProvider>
  );
}
