import type { FieldErrors } from "react-hook-form";

/** Busca a mensagem de erro de um campo aninhado em `formState.errors` a
 * partir do mesmo caminho usado em `register`/`name` (ex.:
 * `"propulsion.combustion_chamber.length_m"`). */
export function getFieldErrorMessage(errors: FieldErrors, path: string): string | undefined {
  let current: unknown = errors;
  for (const segment of path.split(".")) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  if (current && typeof current === "object" && "message" in current) {
    const message = (current as { message?: unknown }).message;
    return typeof message === "string" ? message : undefined;
  }
  return undefined;
}
