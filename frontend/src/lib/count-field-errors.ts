/** Conta os campos com erro em um nó (possivelmente aninhado) de
 * `formState.errors` do React Hook Form — ex.: `errors.propulsion`, para
 * o total de campos inválidos de um subsistema. */
export function countFieldErrors(node: unknown): number {
  if (node == null || typeof node !== "object") {
    return 0;
  }
  // Folha (`FieldError`): tem `type`. Não descer nela — `ref` aponta para
  // o elemento do DOM.
  if ("type" in node && typeof (node as { type: unknown }).type === "string") {
    return 1;
  }
  return Object.values(node).reduce<number>((total, child) => total + countFieldErrors(child), 0);
}
