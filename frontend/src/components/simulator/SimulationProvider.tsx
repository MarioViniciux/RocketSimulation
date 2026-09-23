"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import { ApiError, apiPost } from "@/lib/api";
import type { RocketConfig, SimulationResult } from "@/types";

export type SimulationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: SimulationResult }
  | { status: "error"; message: string };

interface SimulationContextValue {
  state: SimulationState;
  /** Chama `POST /simulate` com o `config` informado, atualizando `state`
   * pelos estados de carregamento/erro/sucesso. Quem dispara essa chamada
   * a partir do preenchimento dos formulários é a Fase 9 - este provider
   * só cuida do estado da chamada em si. */
  runSimulation: (config: RocketConfig) => Promise<void>;
  reset: () => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

/** Estado compartilhado da chamada a `POST /simulate`: carregamento, erro
 * (validação do Pydantic ou `SimulationError` de física/instabilidade) e
 * sucesso. Qualquer componente dentro deste provider pode disparar
 * `runSimulation` (ex.: um futuro botão "Simular") ou só ler `state` para
 * refletir o resultado (ex.: `ResultsPanel`). */
export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SimulationState>({ status: "idle" });

  const runSimulation = useCallback(async (config: RocketConfig) => {
    setState({ status: "loading" });
    try {
      const result = await apiPost<SimulationResult>("/simulate", config);
      setState({ status: "success", result });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível conectar à API. Verifique se o backend está rodando.";
      setState({ status: "error", message });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return (
    <SimulationContext.Provider value={{ state, runSimulation, reset }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation(): SimulationContextValue {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation deve ser usado dentro de um SimulationProvider.");
  }
  return context;
}
