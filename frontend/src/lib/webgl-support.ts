"use client";

import { useSyncExternalStore } from "react";

/** Tenta criar um contexto WebGL2 ou WebGL num `<canvas>` descartável.
 * Alguns navegadores lançam exceção (em vez de retornar `null`) quando
 * WebGL está desabilitado, daí o `try/catch`. Só funciona no navegador —
 * chame apenas a partir de `useWebGLSupport` (nunca durante SSR). */
export function detectWebGLSupport(): boolean {
  if (typeof document === "undefined") {
    return false;
  }
  try {
    const canvas = document.createElement("canvas");
    const context =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    return context !== null;
  } catch {
    return false;
  }
}

/** O suporte a WebGL não muda durante a sessão do navegador; não há nada
 * para observar de fato, mas `useSyncExternalStore` exige a forma de uma
 * função de inscrição/cancelamento. */
function subscribe(): () => void {
  return () => {};
}

let cachedSupport: boolean | undefined;

/** Memoizado no escopo do módulo: criar um `<canvas>`/contexto WebGL a
 * cada checagem seria desperdício, já que o resultado não muda. */
function getSnapshot(): boolean {
  cachedSupport ??= detectWebGLSupport();
  return cachedSupport;
}

/** Otimista durante o SSR (sem acesso ao navegador real): assume suporte
 * até a checagem real no cliente (`getSnapshot`) dizer o contrário — evita
 * piscar para o fallback 2D à toa em navegadores que suportam WebGL. */
function getServerSnapshot(): boolean {
  return true;
}

/** `true` assim que a checagem roda no cliente (ou de forma otimista
 * durante SSR); `false` depois que `detectWebGLSupport()` confirma a
 * ausência de suporte no navegador real. */
export function useWebGLSupport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
