"use client";

import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { countFieldErrors } from "@/lib/count-field-errors";
import { subsystemSectionId, type SubsystemInfo } from "@/lib/subsystems";
import type { RocketConfig } from "@/types";
import { ErrorCountBadge } from "./ErrorCountBadge";

interface SubsystemSectionProps {
  subsystem: SubsystemInfo;
  children: ReactNode;
}

/** Cartão de um subsistema na entrada de dados: título, descrição curta e
 * a quantidade de campos inválidos do subsistema, se houver. */
export function SubsystemSection({ subsystem, children }: SubsystemSectionProps) {
  const {
    formState: { errors },
  } = useFormContext<RocketConfig>();
  const errorCount = countFieldErrors(errors[subsystem.key]);
  const sectionId = subsystemSectionId(subsystem.key);
  const headingId = `${sectionId}-heading`;

  return (
    <section
      id={sectionId}
      aria-labelledby={headingId}
      className={`flex scroll-mt-20 flex-col gap-4 rounded-lg border p-5 ${
        errorCount > 0 ? "border-red-500/60" : "border-black/10 dark:border-white/10"
      }`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 id={headingId} className="text-base font-semibold">
            {subsystem.label}
          </h3>
          <ErrorCountBadge count={errorCount} />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{subsystem.description}</p>
      </div>
      {children}
    </section>
  );
}
