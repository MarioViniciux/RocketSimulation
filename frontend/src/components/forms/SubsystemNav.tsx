"use client";

import { useFormContext } from "react-hook-form";
import { countFieldErrors } from "@/lib/count-field-errors";
import { SUBSYSTEMS, subsystemSectionId } from "@/lib/subsystems";
import type { RocketConfig } from "@/types";
import { ErrorCountBadge } from "./ErrorCountBadge";

/** Navegação fixa entre os subsistemas da entrada de dados, com a
 * quantidade de campos inválidos de cada um — para achar rapidamente o
 * que precisa ser corrigido sem rolar o formulário inteiro. */
export function SubsystemNav() {
  const {
    formState: { errors },
  } = useFormContext<RocketConfig>();

  return (
    <nav
      aria-label="Subsistemas"
      className="sticky top-0 z-10 -mx-6 border-b border-black/10 bg-background px-6 py-2 dark:border-white/10"
    >
      <ul className="flex flex-wrap gap-1">
        {SUBSYSTEMS.map((subsystem) => {
          const errorCount = countFieldErrors(errors[subsystem.key]);
          return (
            <li key={subsystem.key}>
              <a
                href={`#${subsystemSectionId(subsystem.key)}`}
                className="flex items-center gap-1.5 rounded px-2 py-1 text-sm text-zinc-600 hover:bg-black/5 hover:text-foreground dark:text-zinc-400 dark:hover:bg-white/10"
              >
                {subsystem.label}
                <ErrorCountBadge count={errorCount} />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
