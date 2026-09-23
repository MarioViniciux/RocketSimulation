import { SimulatorWorkspace } from "@/components/simulator/SimulatorWorkspace";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-black/10 px-6 py-4 dark:border-white/10">
        <h1 className="text-xl font-semibold">Simulador de Voo para Foguetes de Competição</h1>
      </header>
      <SimulatorWorkspace />
    </div>
  );
}
