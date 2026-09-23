"use client";

import { useFormContext } from "react-hook-form";
import type { FieldPath } from "react-hook-form";
import { getFieldErrorMessage } from "@/lib/get-field-error-message";
import type { RocketConfig } from "@/types";

interface NumberFieldProps {
  name: FieldPath<RocketConfig>;
  label: string;
  unit: string;
  step?: number | "any";
}

/** Campo numérico rotulado, com a unidade (SI) exibida ao lado do rótulo e
 * a mensagem de erro de validação (`rocketConfigSchema`), se houver. */
export function NumberField({ name, label, unit, step = "any" }: NumberFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<RocketConfig>();
  const error = getFieldErrorMessage(errors, name);

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">
        {label} <span className="text-zinc-500 dark:text-zinc-400">({unit})</span>
      </span>
      <input
        type="number"
        step={step}
        aria-invalid={error ? true : undefined}
        className={`rounded border bg-transparent px-2 py-1 ${
          error ? "border-red-500" : "border-black/15 dark:border-white/15"
        }`}
        {...register(name, { valueAsNumber: true })}
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
