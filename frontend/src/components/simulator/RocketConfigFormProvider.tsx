"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ROCKET_CONFIG_DEFAULT_VALUES } from "@/lib/rocket-config-defaults";
import { rocketConfigSchema } from "@/lib/validation";
import type { RocketConfig } from "@/types";

interface RocketConfigFormProviderProps {
  children: ReactNode;
}

/** Estado global/agregado do formulário: um único `RocketConfig` completo,
 * composto pelos 6 formulários de subsistema (Propulsão, Aviônica,
 * Payload, Estrutura, Recuperação, Ambiente — Fase 6).
 *
 * Qualquer componente dentro deste provider pode ler e escrever nesse
 * estado compartilhado via `useFormContext<RocketConfig>()` (como os
 * próprios formulários de entrada) ou, para leitura reativa sem registrar
 * campos, via `useRocketConfigValues()` (ex.: o visualizador 2D/3D da
 * Fase 7 e o dashboard de resultados da Fase 8). */
export function RocketConfigFormProvider({ children }: RocketConfigFormProviderProps) {
  const formMethods = useForm<RocketConfig>({
    defaultValues: ROCKET_CONFIG_DEFAULT_VALUES,
    resolver: zodResolver(rocketConfigSchema),
    mode: "onBlur",
  });

  return <FormProvider {...formMethods}>{children}</FormProvider>;
}
