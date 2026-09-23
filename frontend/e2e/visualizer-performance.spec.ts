import { expect, test, type Page } from "@playwright/test";
import { fillField, waitForHydration } from "./helpers";

/** Guarda de regressão da performance do visualizador 3D (Fase 10 do
 * `ROADMAP.md`): o canvas só é criado quando a aba é aberta e só redesenha
 * quando algo muda — nunca em loop contínuo, nem com a aba oculta.
 *
 * Mede-se o número de chamadas de desenho do WebGL (`drawElements`/
 * `drawArrays`), instrumentadas antes do carregamento da página. */

declare global {
  interface Window {
    __webglDrawCalls: number;
  }
}

const IDLE_WINDOW_MS = 1500;

async function drawCallsDuring(page: Page, action: () => Promise<void>): Promise<number> {
  await page.evaluate(() => (window.__webglDrawCalls = 0));
  await action();
  return page.evaluate(() => window.__webglDrawCalls);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__webglDrawCalls = 0;
    for (const context of [WebGLRenderingContext, WebGL2RenderingContext]) {
      for (const method of ["drawElements", "drawArrays"] as const) {
        const original = context.prototype[method] as (...args: unknown[]) => void;
        (context.prototype[method] as unknown) = function (this: unknown, ...args: unknown[]) {
          window.__webglDrawCalls += 1;
          return original.apply(this, args);
        };
      }
    }
  });
  await page.goto("/");
  await waitForHydration(page);
});

test("canvas 3D só é criado ao abrir o visualizador e não redesenha em repouso", async ({
  page,
}) => {
  const visualizerPanel = page.getByRole("tabpanel", { name: "Visualizador", includeHidden: true });
  await expect(visualizerPanel.locator("canvas")).toHaveCount(0);

  await page.getByRole("tab", { name: "Visualizador" }).click();
  test.skip(
    !(await visualizerPanel.getByRole("tab", { name: "3D" }).isEnabled()),
    "Navegador sem WebGL: o visualizador usa o fallback 2D.",
  );
  const canvas = visualizerPanel.locator("canvas");
  await expect(canvas).toBeVisible();

  // Primeiro quadro desenhado; depois, em repouso, nenhum redesenho.
  await expect.poll(() => page.evaluate(() => window.__webglDrawCalls)).toBeGreaterThan(0);
  await page.waitForTimeout(500);
  const idleDraws = await drawCallsDuring(page, () => page.waitForTimeout(IDLE_WINDOW_MS));
  expect(idleDraws).toBe(0);

  // Interação (órbita da câmera) redesenha...
  const box = (await canvas.boundingBox())!;
  const dragDraws = await drawCallsDuring(page, async () => {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 150, box.y + box.height / 2, { steps: 10 });
    await page.mouse.up();
  });
  expect(dragDraws).toBeGreaterThan(0);

  // ...e, terminado o amortecimento (decaimento exponencial, que pode
  // levar alguns segundos após um arraste rápido), volta ao repouso.
  await expect
    .poll(() => drawCallsDuring(page, () => page.waitForTimeout(500)), { timeout: 15_000 })
    .toBe(0);
  const afterDragDraws = await drawCallsDuring(page, () => page.waitForTimeout(IDLE_WINDOW_MS));
  expect(afterDragDraws).toBe(0);
});

test("canvas 3D não redesenha com a aba oculta, e reflete as edições ao voltar", async ({
  page,
}) => {
  const visualizerTab = page.getByRole("tab", { name: "Visualizador" });
  const visualizerPanel = page.getByRole("tabpanel", { name: "Visualizador", includeHidden: true });
  await visualizerTab.click();
  test.skip(
    !(await visualizerPanel.getByRole("tab", { name: "3D" }).isEnabled()),
    "Navegador sem WebGL: o visualizador usa o fallback 2D.",
  );
  await expect(visualizerPanel.locator("canvas")).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__webglDrawCalls)).toBeGreaterThan(0);

  await page.getByRole("tab", { name: "Entrada de Dados" }).click();
  const hiddenDraws = await drawCallsDuring(page, async () => {
    await fillField(page, "structure.total_length_m", "2.5");
    await fillField(page, "structure.fins.count", "4");
    await page.waitForTimeout(IDLE_WINDOW_MS);
  });
  expect(hiddenDraws).toBe(0);

  // Ao voltar para a aba, a cena é redesenhada com a nova geometria: cada
  // quadro desenha corpo + coifa + 1 malha por aleta (4, após a edição).
  const drawsPerFrame = 2 + 4;
  const reactivationDraws = await drawCallsDuring(page, async () => {
    await visualizerTab.click();
    await page.waitForTimeout(500);
  });
  expect(reactivationDraws).toBeGreaterThan(0);
  expect(reactivationDraws % drawsPerFrame).toBe(0);
});
