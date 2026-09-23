"use client";

import { useId } from "react";
import { useFormContext } from "react-hook-form";
import type { FieldPath } from "react-hook-form";
import { getFieldErrorMessage } from "@/lib/get-field-error-message";
import type { RocketConfig } from "@/types";

interface NumberFieldProps {
  name: FieldPath<RocketConfig>;
  label: string;
  unit: string;
  step?: number | "any";
  /** Texto de apoio sob o campo (ex.: referencial de uma posição), sempre
   * visível — ao contrário da mensagem de erro. */
  hint?: string;
}

/** Campo numérico rotulado, com a unidade (SI) exibida ao lado do rótulo,
 * um texto de apoio opcional e a mensagem de erro de validação
 * (`rocketConfigSchema`), se houver — ambos associados ao `<input>` via
 * `aria-describedby`, para leitores de tela. */
export function NumberField({ name, label, unit, step = "any", hint }: NumberFieldProps) {
  const id = useId();
  const {
    register,
    formState: { errors },
  } = useFormContext<RocketConfig>();
  const error = getFieldErrorMessage(errors, name);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">
        {label} <span className="text-zinc-500 dark:text-zinc-400">({unit})</span>
      </span>
      <input
        type="number"
        step={step}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`rounded border bg-transparent px-2 py-1 ${
          error ? "border-red-500" : "border-black/15 dark:border-white/15"
        }`}
        {...register(name, { valueAsNumber: true })}
      />
      {hint ? (
        <span id={hintId} className="text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className="text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      ) : null}
    </label>
  );
}
