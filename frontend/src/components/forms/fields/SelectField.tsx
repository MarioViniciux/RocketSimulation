"use client";

import { useFormContext } from "react-hook-form";
import type { FieldPath } from "react-hook-form";
import { getFieldErrorMessage } from "@/lib/get-field-error-message";
import type { RocketConfig } from "@/types";

interface SelectFieldOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  name: FieldPath<RocketConfig>;
  label: string;
  options: readonly SelectFieldOption[];
}

/** Campo de seleção rotulado, para campos com um conjunto fixo de opções
 * (ex.: `NoseConeShape`), com a mensagem de erro de validação, se houver. */
export function SelectField({ name, label, options }: SelectFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<RocketConfig>();
  const error = getFieldErrorMessage(errors, name);

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <select
        aria-invalid={error ? true : undefined}
        className={`rounded border bg-transparent px-2 py-1 ${
          error ? "border-red-500" : "border-black/15 dark:border-white/15"
        }`}
        {...register(name)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
