import type { ComponentType } from "react";
import { AvionicsForm } from "@/components/forms/AvionicsForm";
import { EnvironmentForm } from "@/components/forms/EnvironmentForm";
import { PayloadForm } from "@/components/forms/PayloadForm";
import { PropulsionForm } from "@/components/forms/PropulsionForm";
import { RecoveryForm } from "@/components/forms/RecoveryForm";
import { StructureForm } from "@/components/forms/StructureForm";
import { SubsystemNav } from "@/components/forms/SubsystemNav";
import { SubsystemSection } from "@/components/forms/SubsystemSection";
import { SUBSYSTEMS } from "@/lib/subsystems";
import type { RocketConfig } from "@/types";
import { SimulateButton } from "./SimulateButton";

const SUBSYSTEM_FORMS: Record<keyof RocketConfig, ComponentType> = {
  propulsion: PropulsionForm,
  avionics: AvionicsForm,
  payload: PayloadForm,
  structure: StructureForm,
  recovery: RecoveryForm,
  environment: EnvironmentForm,
};

interface InputPanelProps {
  /** Ver `SimulateButton`. */
  onSimulated?: () => void;
}

export function InputPanel({ onSimulated }: InputPanelProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Entrada de Dados</h2>
        <p className="max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
          Informe os parâmetros de cada subsistema do foguete, sempre em unidades do SI. Os valores
          já preenchidos formam uma configuração válida de exemplo. Posições são medidas ao longo do
          eixo do foguete, a partir da ponta da coifa.
        </p>
      </div>

      <SubsystemNav />

      {SUBSYSTEMS.map((subsystem) => {
        const Form = SUBSYSTEM_FORMS[subsystem.key];
        return (
          <SubsystemSection key={subsystem.key} subsystem={subsystem}>
            <Form />
          </SubsystemSection>
        );
      })}

      <SimulateButton onSimulated={onSimulated} />
    </div>
  );
}
