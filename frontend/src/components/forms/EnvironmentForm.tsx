"use client";

import { useFormContext } from "react-hook-form";
import type { RocketConfig } from "@/types";
import { NumberField } from "./fields/NumberField";

/** Formulário do subsistema Ambiente/Localização: coordenadas geográficas,
 * elevação, vento e trilho de lançamento (ver `app/environment/schemas.py`
 * no backend). Lê e escreve no `RocketConfig` compartilhado via
 * `useFormContext`. */
export function EnvironmentForm() {
  const { register } = useFormContext<RocketConfig>();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <NumberField
        register={register}
        name="environment.latitude_deg"
        label="Latitude"
        unit="graus"
      />
      <NumberField
        register={register}
        name="environment.longitude_deg"
        label="Longitude"
        unit="graus"
      />
      <NumberField
        register={register}
        name="environment.elevation_m"
        label="Elevação (nível do mar)"
        unit="m"
      />
      <NumberField
        register={register}
        name="environment.wind_speed_m_s"
        label="Velocidade do vento prevista"
        unit="m/s"
      />
      <NumberField
        register={register}
        name="environment.launch_rail_length_m"
        label="Comprimento do trilho"
        unit="m"
      />
      <NumberField
        register={register}
        name="environment.launch_rail_angle_deg"
        label="Inclinação do trilho (a partir da vertical)"
        unit="graus"
      />
    </div>
  );
}
