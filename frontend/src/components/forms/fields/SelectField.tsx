import type { FieldPath, FieldValues, UseFormRegister } from "react-hook-form";

interface SelectFieldOption {
  value: string;
  label: string;
}

interface SelectFieldProps<TFieldValues extends FieldValues> {
  register: UseFormRegister<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  options: readonly SelectFieldOption[];
}

/** Campo de seleção rotulado, para campos com um conjunto fixo de opções
 * (ex.: `NoseConeShape`). */
export function SelectField<TFieldValues extends FieldValues>({
  register,
  name,
  label,
  options,
}: SelectFieldProps<TFieldValues>) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <select
        className="rounded border border-black/15 bg-transparent px-2 py-1 dark:border-white/15"
        {...register(name)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
