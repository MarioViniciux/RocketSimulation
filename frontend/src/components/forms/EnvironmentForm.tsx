import { NumberField } from "./fields/NumberField";

/** Formulário do subsistema Ambiente/Localização: coordenadas geográficas,
 * elevação, vento e trilho de lançamento (ver `app/environment/schemas.py`
 * no backend). Lê e escreve no `RocketConfig` compartilhado via
 * `useFormContext` (dentro de `NumberField`). */
export function EnvironmentForm() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <NumberField
        name="environment.latitude_deg"
        label="Latitude"
        unit="graus"
        hint="Positiva ao norte do Equador."
      />
      <NumberField
        name="environment.longitude_deg"
        label="Longitude"
        unit="graus"
        hint="Positiva a leste de Greenwich."
      />
      <NumberField
        name="environment.elevation_m"
        label="Elevação (nível do mar)"
        unit="m"
      />
      <NumberField
        name="environment.wind_speed_m_s"
        label="Velocidade do vento prevista"
        unit="m/s"
      />
      <NumberField
        name="environment.launch_rail_length_m"
        label="Comprimento do trilho"
        unit="m"
      />
      <NumberField
        name="environment.launch_rail_angle_deg"
        label="Inclinação do trilho (a partir da vertical)"
        unit="graus"
        hint="0° = trilho vertical."
      />
    </div>
  );
}
