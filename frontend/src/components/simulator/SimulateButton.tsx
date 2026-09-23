"use client";

import { useFormContext } from "react-hook-form";
import { countFieldErrors } from "@/lib/count-field-errors";
import { SUBSYSTEMS, subsystemSectionId } from "@/lib/subsystems";
import type { RocketConfig } from "@/types";
import { useSimulation } from "./SimulationProvider";

interface SimulateButtonProps {
  /** Chamado após uma chamada a `POST /simulate` concluída (sucesso ou
   * erro) a partir de um `RocketConfig` válido — ex.: navegar para a aba
   * de Resultados, que já reflete `useSimulation().state` sozinha. */
  onSimulated?: () => void;
}

/** Dispara a simulação com o `RocketConfig` atual, reaproveitando a mesma
 * validação (`rocketConfigSchema` via `zodResolver`) do
 * `RocketConfigFormProvider`. Payload inválido: `handleSubmit` não chama
 * `runSimulation` e cada `NumberField` já exibe seu próprio erro. */
export function SimulateButton({ onSimulated }: SimulateButtonProps) {
  const { handleSubmit, formState } = useFormContext<RocketConfig>();
  const { runSimulation, state } = useSimulation();
  const isSubmitting = state.status === "loading";
  const subsystemsWithErrors = SUBSYSTEMS.map((subsystem) => ({
    ...subsystem,
    errorCount: countFieldErrors(formState.errors[subsystem.key]),
  })).filter((subsystem) => subsystem.errorCount > 0);

  const onSubmit = handleSubmit(async (config) => {
    await runSimulation(config);
    onSimulated?.();
  });

  return (
    <div className="flex flex-col gap-2 border-t border-black/10 pt-4 dark:border-white/10">
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="self-start rounded bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Simulando…" : "Executar Simulação"}
      </button>
      {formState.submitCount > 0 && subsystemsWithErrors.length > 0 ? (
        <div role="alert" className="flex flex-col gap-1 text-sm text-red-600 dark:text-red-400">
          <p>Corrija os campos destacados antes de executar a simulação:</p>
          <ul className="list-disc pl-5">
            {subsystemsWithErrors.map((subsystem) => (
              <li key={subsystem.key}>
                <a href={`#${subsystemSectionId(subsystem.key)}`} className="underline">
                  {subsystem.label}
                </a>{" "}
                — {subsystem.errorCount}{" "}
                {subsystem.errorCount === 1 ? "campo inválido" : "campos inválidos"}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
