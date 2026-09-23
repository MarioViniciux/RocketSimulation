import type { FieldPath, FieldValues, UseFormRegister } from "react-hook-form";

interface CheckboxFieldProps<TFieldValues extends FieldValues> {
  register: UseFormRegister<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
}

/** Campo booleano rotulado (checkbox). */
export function CheckboxField<TFieldValues extends FieldValues>({
  register,
  name,
  label,
}: CheckboxFieldProps<TFieldValues>) {
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
