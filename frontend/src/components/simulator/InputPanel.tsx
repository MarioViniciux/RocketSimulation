import { AvionicsForm } from "@/components/forms/AvionicsForm";
import { EnvironmentForm } from "@/components/forms/EnvironmentForm";
import { PayloadForm } from "@/components/forms/PayloadForm";
import { PropulsionForm } from "@/components/forms/PropulsionForm";
import { RecoveryForm } from "@/components/forms/RecoveryForm";
import { StructureForm } from "@/components/forms/StructureForm";
import { SimulateButton } from "./SimulateButton";

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
          Formulários por subsistema (Propulsão, Aviônica, Payload, Estrutura, Recuperação,
          Ambiente) que compõem o <code className="font-mono">RocketConfig</code> enviado para a
          simulação.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h3 className="text-base font-semibold">Propulsão</h3>
        <PropulsionForm />
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-base font-semibold">Aviônica</h3>
        <AvionicsForm />
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-base font-semibold">Payload</h3>
        <PayloadForm />
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-base font-semibold">Estrutura</h3>
        <StructureForm />
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-base font-semibold">Recuperação</h3>
        <RecoveryForm />
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-base font-semibold">Ambiente/Localização</h3>
        <EnvironmentForm />
      </section>

      <SimulateButton onSimulated={onSimulated} />
    </div>
  );
}
