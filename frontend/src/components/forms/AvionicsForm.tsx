import { NumberField } from "./fields/NumberField";

/** Formulário do subsistema Aviônica: massa, posição (X, Y, Z), diâmetro e
 * comprimento (ver `app/avionics/schemas.py` no backend). Lê e escreve no
 * `RocketConfig` compartilhado via `useFormContext` (dentro de `NumberField`). */
export function AvionicsForm() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <NumberField name="avionics.mass_kg" label="Massa" unit="kg" />
      <NumberField name="avionics.diameter_m" label="Diâmetro" unit="m" />
      <NumberField name="avionics.length_m" label="Comprimento" unit="m" />
      <NumberField name="avionics.position_x_m" label="Posição X" unit="m" />
      <NumberField name="avionics.position_y_m" label="Posição Y" unit="m" />
      <NumberField name="avionics.position_z_m" label="Posição Z" unit="m" />
    </div>
  );
}
