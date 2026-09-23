"use client";

import { useFormContext, useWatch } from "react-hook-form";
import type { RocketConfig } from "@/types";

/** Lê o `RocketConfig` agregado atual (os 6 subsistemas), atualizado em
 * tempo real a cada mudança em qualquer formulário. Para componentes que
 * apenas precisam refletir o estado ao vivo (ex.: o visualizador 2D/3D),
 * sem registrar campos como os próprios formulários de entrada fazem. */
export function useRocketConfigValues(): RocketConfig {
  const { control } = useFormContext<RocketConfig>();
  // `useWatch` sem `name` tipa o retorno como parcial (proteção genérica da
  // biblioteca para o caso geral), mas como `ROCKET_CONFIG_DEFAULT_VALUES`
  // preenche os 6 subsistemas e todo campo é registrado desde a montagem
  // (ver `RocketConfigFormProvider`), o valor é sempre um `RocketConfig`
  // completo em tempo de execução.
  return useWatch({ control }) as RocketConfig;
}
