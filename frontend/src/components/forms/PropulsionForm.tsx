import { NumberField } from "./fields/NumberField";

/** Formulário do subsistema Propulsão: câmara de combustão, grão propelente,
 * bocal convergente-divergente, inércia/CM seco e parâmetros termodinâmicos
 * de impulso (ver `app/propulsion/schemas.py` no backend). Lê e escreve no
 * `RocketConfig` compartilhado via `useFormContext` (dentro de `NumberField`). */
export function PropulsionForm() {
  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          Câmara de Combustão
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberField name="propulsion.combustion_chamber.length_m" label="Comprimento" unit="m" />
          <NumberField name="propulsion.combustion_chamber.diameter_m" label="Diâmetro" unit="m" />
          <NumberField
            name="propulsion.combustion_chamber.empty_mass_kg"
            label="Massa vazia"
            unit="kg"
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          Grão Propelente
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <NumberField
            name="propulsion.propellant_grain.propellant_mass_kg"
            label="Massa do propelente"
            unit="kg"
          />
          <NumberField
            name="propulsion.propellant_grain.grain_count"
            label="Quantidade de grãos"
            unit="un"
            step={1}
          />
          <NumberField
            name="propulsion.propellant_grain.grain_diameter_m"
            label="Diâmetro do grão"
            unit="m"
          />
          <NumberField
            name="propulsion.propellant_grain.single_grain_burn_time_s"
            label="Tempo de queima (1 grão)"
            unit="s"
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          Bocal Convergente-Divergente
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <NumberField
            name="propulsion.nozzle.throat_diameter_m"
            label="Diâmetro da garganta"
            unit="m"
          />
          <NumberField
            name="propulsion.nozzle.exit_diameter_m"
            label="Diâmetro de saída"
            unit="m"
          />
          <NumberField name="propulsion.nozzle.length_m" label="Comprimento" unit="m" />
          <NumberField name="propulsion.nozzle.position_m" label="Posição" unit="m" />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          Inércia e Massa (Seco)
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            name="propulsion.dry_inertia.dry_inertia_kg_m2"
            label="Inércia seca"
            unit="kg·m²"
          />
          <NumberField
            name="propulsion.dry_inertia.dry_center_of_mass_m"
            label="Centro de massa seco (CMₛ)"
            unit="m"
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          Parâmetros Termodinâmicos e de Impulso
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <NumberField
            name="propulsion.thermodynamic_impulse_parameters.reference_pressure_pa"
            label="Pressão de referência"
            unit="Pa"
          />
          <NumberField
            name="propulsion.thermodynamic_impulse_parameters.total_impulse_ns"
            label="Impulso total"
            unit="N·s"
          />
          <NumberField
            name="propulsion.thermodynamic_impulse_parameters.pressure_impulse_ns"
            label="Impulso de pressão"
            unit="N·s"
          />
          <NumberField
            name="propulsion.thermodynamic_impulse_parameters.exhaust_velocity_m_s"
            label="Velocidade de exaustão"
            unit="m/s"
          />
        </div>
      </fieldset>
    </div>
  );
}
