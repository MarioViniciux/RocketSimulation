"use client";

import { useFormContext } from "react-hook-form";
import type { RocketConfig } from "@/types";
import { NumberField } from "./fields/NumberField";

/** Formulário do subsistema Payload/Satélite: massa, posição (X, Y, Z),
 * diâmetro e comprimento (ver `app/payload/schemas.py` no backend). Lê e
 * escreve no `RocketConfig` compartilhado via `useFormContext`. */
export function PayloadForm() {
  const { register } = useFormContext<RocketConfig>();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <NumberField register={register} name="payload.mass_kg" label="Massa" unit="kg" />
      <NumberField register={register} name="payload.diameter_m" label="Diâmetro" unit="m" />
      <NumberField register={register} name="payload.length_m" label="Comprimento" unit="m" />
      <NumberField register={register} name="payload.position_x_m" label="Posição X" unit="m" />
      <NumberField register={register} name="payload.position_y_m" label="Posição Y" unit="m" />
      <NumberField register={register} name="payload.position_z_m" label="Posição Z" unit="m" />
    </div>
  );
}
