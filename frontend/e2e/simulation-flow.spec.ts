import { expect, test, type Page } from "@playwright/test";
import type { RocketConfig, SimulationResult } from "@/types";

/** Testes end-to-end do fluxo principal (Fase 9 do `ROADMAP.md`):
 * preenchimento dos formulários → chamada `POST /simulate` → visualizador
 * atualizado → dashboard populado. Rodam contra o backend FastAPI real
 * (ver `playwright.config.ts`); só os cenários de loading/falha de rede
 * interceptam a requisição, por não serem reproduzíveis de forma
 * determinística com o backend real. */

const SIMULATE_PATH = "/simulate";

/** Campo numérico do `RocketConfig`, localizado pelo `name` que o
 * `register` do React Hook Form atribui ao `<input>` (ex.:
 * `structure.total_length_m`). */
function field(page: Page, name: string) {
  return page.locator(`input[name="${name}"]`);
}

async function fillField(page: Page, name: string, value: string) {
  const input = field(page, name);
  await input.fill(value);
  // Validação do formulário é `mode: "onBlur"`.
  await input.blur();
}

function isSimulateRequest(url: string, method: string): boolean {
  return method === "POST" && new URL(url).pathname === SIMULATE_PATH;
}

function formatPtBr(value: number, unit: string, fractionDigits = 1): string {
  const formatted = value.toLocaleString("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return `${formatted} ${unit}`;
}

function statTile(page: Page, label: string) {
  return page
    .getByRole("tabpanel", { name: "Resultados" })
    .locator("div", { has: page.getByText(label, { exact: true }) })
    .last();
}

/** Aguarda a hidratação do React: antes dela, o HTML do SSR já exibe os
 * campos, mas o que for digitado é sobrescrito quando o React Hook Form
 * registra os `<input>` com os valores padrão. A troca de abas só funciona
 * após a hidratação, então serve de sinal. */
async function waitForHydration(page: Page) {
  const inputTab = page.getByRole("tab", { name: "Entrada de Dados" });
  const visualizerTab = page.getByRole("tab", { name: "Visualizador" });
  await expect(async () => {
    await visualizerTab.click();
    await expect(visualizerTab).toHaveAttribute("aria-selected", "true", { timeout: 500 });
  }).toPass();
  await inputTab.click();
  await expect(inputTab).toHaveAttribute("aria-selected", "true");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await waitForHydration(page);
});

test("entrada → simulação → dashboard populado com os resultados do backend", async ({ page }) => {
  await fillField(page, "structure.drag_coefficient", "0.5");
  await fillField(page, "environment.wind_speed_m_s", "3");

  const requestPromise = page.waitForRequest((req) => isSimulateRequest(req.url(), req.method()));
  const responsePromise = page.waitForResponse((res) =>
    isSimulateRequest(res.url(), res.request().method()),
  );
  await page.getByRole("button", { name: "Executar Simulação" }).click();

  // Payload: o `RocketConfig` completo, em SI, com números (não strings) e
  // os valores editados nos formulários.
  const payload = (await requestPromise).postDataJSON() as RocketConfig;
  expect(Object.keys(payload).sort()).toEqual(
    ["avionics", "environment", "payload", "propulsion", "recovery", "structure"].sort(),
  );
  expect(payload.structure.drag_coefficient).toBe(0.5);
  expect(payload.environment.wind_speed_m_s).toBe(3);
  expect(typeof payload.structure.total_length_m).toBe("number");

  const response = await responsePromise;
  expect(response.status()).toBe(200);
  const result = (await response.json()) as SimulationResult;
  expect(result.apogee_altitude_m).toBeGreaterThan(0);

  // Após a simulação, o workspace navega sozinho para a aba de Resultados.
  await expect(page.getByRole("tab", { name: "Resultados" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  const resultsPanel = page.getByRole("tabpanel", { name: "Resultados" });
  await expect(resultsPanel).toBeVisible();

  // KPIs exibem exatamente os valores retornados pelo backend.
  await expect(statTile(page, "Apogeu")).toContainText(formatPtBr(result.apogee_altitude_m, "m"));
  await expect(statTile(page, "Margem de estabilidade")).toContainText(
    formatPtBr(result.stability_margin_calibers, "cal", 2),
  );
  await expect(statTile(page, "Velocidade terminal (main)")).toContainText(
    formatPtBr(result.main_terminal_velocity_m_s, "m/s"),
  );
  await expect(statTile(page, "Tempo de queima")).toContainText(
    formatPtBr(result.burn_time_s, "s"),
  );
  if (result.drogue_terminal_velocity_m_s === null) {
    await expect(resultsPanel.getByText("Velocidade terminal (drogue)")).toHaveCount(0);
  } else {
    await expect(statTile(page, "Velocidade terminal (drogue)")).toContainText(
      formatPtBr(result.drogue_terminal_velocity_m_s, "m/s"),
    );
  }

  // Os três gráficos de séries temporais.
  for (const title of ["Altitude", "Velocidade Vertical", "Aceleração Vertical"]) {
    await expect(
      resultsPanel.getByRole("img", { name: `${title} ao longo do tempo` }),
    ).toBeVisible();
  }
  await expect(resultsPanel.getByText(/^Apogeu: /)).toBeVisible();

  // Vista em tabela do gráfico de altitude, com dados reais.
  await resultsPanel.getByRole("button", { name: "Ver como tabela" }).first().click();
  const table = resultsPanel.getByRole("table");
  await expect(table.getByRole("columnheader", { name: "Altitude (m)" })).toBeVisible();
  expect(await table.getByRole("row").count()).toBeGreaterThan(2);
});

test("visualizador reflete as dimensões informadas nos formulários", async ({ page }) => {
  const visualizerTab = page.getByRole("tab", { name: "Visualizador" });
  const visualizerPanel = page.getByRole("tabpanel", { name: "Visualizador" });
  const silhouette = visualizerPanel.getByRole("img", {
    name: "Silhueta 2D do foguete (vista lateral)",
  });

  async function showSilhouette2D() {
    await visualizerTab.click();
    const button2D = visualizerPanel.getByRole("tab", { name: "2D" });
    // Sem WebGL o visualizador já cai sozinho para o 2D.
    if (await button2D.isEnabled()) {
      await button2D.click();
    }
    await expect(silhouette).toBeVisible();
  }

  // Largura do `viewBox` = comprimento total + margens (2% de cada lado).
  const viewBoxWidth = async () =>
    Number((await silhouette.getAttribute("viewBox"))!.split(" ")[2]);

  await showSilhouette2D();
  expect(await viewBoxWidth()).toBeCloseTo(2.0 * 1.04, 5);

  await page.getByRole("tab", { name: "Entrada de Dados" }).click();
  await fillField(page, "structure.total_length_m", "2.5");

  await showSilhouette2D();
  expect(await viewBoxWidth()).toBeCloseTo(2.5 * 1.04, 5);
});

test("validação client-side bloqueia a chamada a /simulate com campos inválidos", async ({
  page,
}) => {
  let simulateCalls = 0;
  page.on("request", (req) => {
    if (isSimulateRequest(req.url(), req.method())) simulateCalls += 1;
  });

  await fillField(page, "structure.body_diameter_m", "-1");
  await expect(field(page, "structure.body_diameter_m")).toHaveAttribute("aria-invalid", "true");

  await page.getByRole("button", { name: "Executar Simulação" }).click();

  // Resumo lista o subsistema com erro (com link para a seção), e o campo
  // mostra a faixa válida completa.
  const summary = page.getByRole("alert").filter({ hasText: "Corrija os campos destacados" });
  await expect(summary).toBeVisible();
  await expect(summary.getByRole("link", { name: "Estrutura" })).toHaveAttribute(
    "href",
    "#subsystem-structure",
  );
  await expect(summary).toContainText("1 campo inválido");
  await expect(
    page.getByRole("navigation", { name: "Subsistemas" }).getByRole("link", { name: /Estrutura/ }),
  ).toContainText("1 erro");
  await expect(field(page, "structure.body_diameter_m")).toHaveAccessibleDescription(
    "Valor fora da faixa: deve ser maior que 0 e no máximo 0,5 m.",
  );
  await expect(page.getByRole("tab", { name: "Entrada de Dados" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  expect(simulateCalls).toBe(0);

  // Corrigido o campo, a simulação volta a ser disparada.
  await fillField(page, "structure.body_diameter_m", "0.1");
  const responsePromise = page.waitForResponse((res) =>
    isSimulateRequest(res.url(), res.request().method()),
  );
  await page.getByRole("button", { name: "Executar Simulação" }).click();
  expect((await responsePromise).status()).toBe(200);
  await expect(statTile(page, "Apogeu")).toBeVisible();
});

test("configuração instável rejeitada pelo backend exibe o erro no dashboard", async ({ page }) => {
  // Mesmo cenário de `test_simulate_rejects_unstable_rocket_configuration_with_422`
  // no backend: aletas quase sem área e coladas ao nariz -> margem negativa.
  // Válido para a validação client-side, mas rejeitado pela física.
  await fillField(page, "structure.fins.semispan_m", "0.01");
  await fillField(page, "structure.fins.root_leading_edge_position_m", "0");

  const responsePromise = page.waitForResponse((res) =>
    isSimulateRequest(res.url(), res.request().method()),
  );
  await page.getByRole("button", { name: "Executar Simulação" }).click();
  expect((await responsePromise).status()).toBe(422);

  const resultsPanel = page.getByRole("tabpanel", { name: "Resultados" });
  const errorAlert = resultsPanel.getByRole("alert");
  await expect(errorAlert).toContainText("Erro na simulação");
  await expect(errorAlert).toContainText(/instável/i);
  await expect(resultsPanel.getByText("Apogeu", { exact: true })).toHaveCount(0);
});

test("exibe o estado de carregamento enquanto a simulação está em andamento", async ({ page }) => {
  let releaseRequest!: () => void;
  const requestReleased = new Promise<void>((resolve) => {
    releaseRequest = resolve;
  });
  await page.route(`**${SIMULATE_PATH}`, async (route) => {
    await requestReleased;
    await route.continue();
  });

  const simulateButton = page.getByRole("button", { name: /Executar Simulação|Simulando…/ });
  await simulateButton.click();

  await expect(simulateButton).toHaveText("Simulando…");
  await expect(simulateButton).toBeDisabled();

  releaseRequest();

  await expect(page.getByRole("tab", { name: "Resultados" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(statTile(page, "Apogeu")).toBeVisible();
  await expect(page.getByText("Simulando o voo do foguete…")).toHaveCount(0);
});

test("falha de conexão com a API exibe mensagem de erro legível", async ({ page }) => {
  await page.route(`**${SIMULATE_PATH}`, (route) => route.abort("connectionrefused"));

  await page.getByRole("button", { name: "Executar Simulação" }).click();

  const errorAlert = page.getByRole("tabpanel", { name: "Resultados" }).getByRole("alert");
  await expect(errorAlert).toContainText("Erro na simulação");
  await expect(errorAlert).toContainText(
    "Não foi possível conectar à API. Verifique se o backend está rodando.",
  );
});
