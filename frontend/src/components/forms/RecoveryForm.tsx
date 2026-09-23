"use client";

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { RocketConfig } from "@/types";
import { CheckboxField } from "./fields/CheckboxField";
import { NumberField } from "./fields/NumberField";

/** Formulário do subsistema Recuperação: presença de drogue, massas,
 * pólvora de ejeção e preditivos de voo (ver `app/recovery/schemas.py` no
 * backend). Lê e escreve no `RocketConfig` compartilhado via
 * `useFormContext`.
 *
 * Os campos do drogue só aparecem quando `has_drogue` está marcado; ao
 * desmarcar, são zerados para `null` (o backend exige que fiquem `null`
 * quando `has_drogue=false`). */
export function RecoveryForm() {
  const { register, control, setValue } = useFormContext<RocketConfig>();
  const hasDrogue = useWatch({ control, name: "recovery.has_drogue" });

  useEffect(() => {
    if (!hasDrogue) {
      setValue("recovery.drogue_deployment_time_s", null);
      setValue("recovery.drogue_drag_coefficient", null);
      setValue("recovery.drogue_diameter_m", null);
    }
  }, [hasDrogue, setValue]);

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          Paraquedas
        </legend>
        <CheckboxField
          register={register}
          name="recovery.has_drogue"
          label="Possui paraquedas drogue (piloto)"
        />
      </fieldset>

      {hasDrogue ? (
        <fieldset className="flex flex-col gap-4">
          <legend className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
            Drogue
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <NumberField
              register={register}
              name="recovery.drogue_deployment_time_s"
              label="Tempo de ativação após o apogeu"
              unit="s"
            />
            <NumberField
              register={register}
              name="recovery.drogue_drag_coefficient"
              label="Coeficiente de arrasto (Cd)"
              unit="adimensional"
            />
            <NumberField
              register={register}
              name="recovery.drogue_diameter_m"
              label="Diâmetro"
              unit="m"
            />
          </div>
        </fieldset>
      ) : null}

      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          Main
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberField
            register={register}
            name="recovery.main_deployment_time_s"
            label="Tempo de ativação após o apogeu"
            unit="s"
          />
          <NumberField
            register={register}
            name="recovery.main_drag_coefficient"
            label="Coeficiente de arrasto (Cd)"
            unit="adimensional"
          />
          <NumberField
            register={register}
            name="recovery.main_diameter_m"
            label="Diâmetro"
            unit="m"
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          Massas e Centro de Massa
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberField
            register={register}
            name="recovery.lower_support_mass_kg"
            label="Massa do suporte inferior"
            unit="kg"
          />
          <NumberField
            register={register}
            name="recovery.parachutes_mass_kg"
            label="Massa dos paraquedas"
            unit="kg"
          />
          <NumberField
            register={register}
            name="recovery.piston_cap_mass_kg"
            label="Massa da tampa do pistão"
            unit="kg"
          />
          <NumberField
            register={register}
            name="recovery.ejection_charge_mass_kg"
            label="Massa de pólvora de ejeção"
            unit="kg"
          />
          <NumberField
            register={register}
            name="recovery.center_of_mass_m"
            label="Centro de massa"
            unit="m"
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
          Preditivos de Voo
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            register={register}
            name="recovery.predicted_terminal_velocity_m_s"
            label="Velocidade terminal prevista"
            unit="m/s"
          />
          <NumberField
            register={register}
            name="recovery.predicted_search_radius_m"
            label="Raio de busca previsto"
            unit="m"
          />
        </div>
      </fieldset>
    </div>
  );
}
