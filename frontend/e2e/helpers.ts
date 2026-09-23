import { expect, type Page } from "@playwright/test";

/** Campo numérico do `RocketConfig`, localizado pelo `name` que o
 * `register` do React Hook Form atribui ao `<input>` (ex.:
 * `structure.total_length_m`). */
export function field(page: Page, name: string) {
  return page.locator(`input[name="${name}"]`);
}

export async function fillField(page: Page, name: string, value: string) {
  const input = field(page, name);
  await input.fill(value);
  // Validação do formulário é `mode: "onBlur"`.
  await input.blur();
}

/** Aguarda a hidratação do React: antes dela, o HTML do SSR já exibe os
 * campos, mas o que for digitado é sobrescrito quando o React Hook Form
 * registra os `<input>` com os valores padrão. A troca de abas só funciona
 * após a hidratação, então serve de sinal — pela aba de Resultados, não
 * a do Visualizador, que montaria o canvas 3D (criado só na primeira
 * abertura da aba). */
export async function waitForHydration(page: Page) {
  const inputTab = page.getByRole("tab", { name: "Entrada de Dados" });
  const resultsTab = page.getByRole("tab", { name: "Resultados" });
  await expect(async () => {
    await resultsTab.click();
    await expect(resultsTab).toHaveAttribute("aria-selected", "true", { timeout: 500 });
  }).toPass();
  await inputTab.click();
  await expect(inputTab).toHaveAttribute("aria-selected", "true");
}
