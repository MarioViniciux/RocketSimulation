"use client";

import { useFormContext } from "react-hook-form";
import { NoseConeShape } from "@/types";
import type { RocketConfig } from "@/types";
import { NumberField } from "./fields/NumberField";
import { SelectField } from "./fields/SelectField";

const NOSE_CONE_SHAPE_OPTIONS = [
  { value: NoseConeShape.OGIVAL, label: "Ogival" },
  { value: NoseConeShape.PARABOLIC, label: "Parabólico" },
  { value: NoseConeShape.CONICAL, label: "Cônico" },
] as const;

/** Formulário do subsistema Estrutura: massa/geometria global, coifa,
 * aletas e rail buttons (ver `app/structure/schemas.py` no backend). Lê e
 * escreve no `RocketConfig` compartilhado via `useFormContext`. */
export function StructureForm() {
  const { register } = useFormContext<RocketConfig>();

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          Massa e Geometria Global
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberField
            register={register}
            name="structure.empty_mass_kg"
            label="Massa vazia (com coifa)"
            unit="kg"
          />
          <NumberField
            register={register}
            name="structure.total_length_m"
            label="Comprimento total (com coifa)"
            unit="m"
          />
          <NumberField
            register={register}
            name="structure.body_diameter_m"
            label="Diâmetro do corpo"
            unit="m"
          />
          <NumberField
            register={register}
            name="structure.center_of_mass_m"
            label="Centro de massa"
            unit="m"
          />
          <NumberField
            register={register}
            name="structure.drag_coefficient"
            label="Coeficiente de arrasto (Cd)"
            unit="adimensional"
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          Coifa (Nose Cone)
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SelectField
            register={register}
            name="structure.nose_cone.shape"
            label="Formato"
            options={NOSE_CONE_SHAPE_OPTIONS}
          />
          <NumberField
            register={register}
            name="structure.nose_cone.length_m"
            label="Comprimento"
            unit="m"
          />
          <NumberField
            register={register}
            name="structure.nose_cone.mass_kg"
            label="Massa"
            unit="kg"
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          Aletas
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <NumberField
            register={register}
            name="structure.fins.count"
            label="Quantidade"
            unit="un"
            step={1}
          />
          <NumberField
            register={register}
            name="structure.fins.mounting_angle_deg"
            label="Angulação de montagem"
            unit="graus"
          />
          <NumberField
            register={register}
            name="structure.fins.root_chord_m"
            label="Corda de raiz"
            unit="m"
          />
          <NumberField
            register={register}
            name="structure.fins.tip_chord_m"
            label="Corda de ponta"
            unit="m"
          />
          <NumberField
            register={register}
            name="structure.fins.semispan_m"
            label="Envergadura (semi-span)"
            unit="m"
          />
          <NumberField
            register={register}
            name="structure.fins.mid_chord_sweep_m"
            label="Enflechamento"
            unit="m"
          />
          <NumberField
            register={register}
            name="structure.fins.root_leading_edge_position_m"
            label="Posição do bordo de ataque da raiz"
            unit="m"
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          Guias de Lançamento (Rail Buttons)
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            register={register}
            name="structure.rail_buttons.count"
            label="Quantidade"
            unit="un"
            step={1}
          />
          <NumberField
            register={register}
            name="structure.rail_buttons.angle_deg"
            label="Angulação"
            unit="graus"
          />
        </div>
      </fieldset>
    </div>
  );
}
