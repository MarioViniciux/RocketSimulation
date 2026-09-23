import type { FieldPath, FieldValues, UseFormRegister } from "react-hook-form";

interface NumberFieldProps<TFieldValues extends FieldValues> {
  register: UseFormRegister<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  unit: string;
  step?: number | "any";
}

/** Campo numérico rotulado, com a unidade (SI) exibida ao lado do rótulo. */
export function NumberField<TFieldValues extends FieldValues>({
  register,
  name,
  label,
  unit,
  step = "any",
}: NumberFieldProps<TFieldValues>) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">
        {label} <span className="text-zinc-500 dark:text-zinc-400">({unit})</span>
      </span>
      <input
        type="number"
        step={step}
        className="rounded border border-black/15 bg-transparent px-2 py-1 dark:border-white/15"
        {...register(name, { valueAsNumber: true })}
      />
    </label>
  );
}
