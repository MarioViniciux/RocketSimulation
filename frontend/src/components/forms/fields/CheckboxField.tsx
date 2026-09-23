"use client";

import { useFormContext } from "react-hook-form";
import type { FieldPath } from "react-hook-form";
import type { RocketConfig } from "@/types";

interface CheckboxFieldProps {
  name: FieldPath<RocketConfig>;
  label: string;
}

/** Campo booleano rotulado (checkbox). */
export function CheckboxField({ name, label }: CheckboxFieldProps) {
  const { register } = useFormContext<RocketConfig>();

  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-black/15 dark:border-white/15"
        {...register(name)}
      />
      {label}
    </label>
  );
}
