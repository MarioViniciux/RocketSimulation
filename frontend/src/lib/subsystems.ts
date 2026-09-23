import type { RocketConfig } from "@/types";

export interface SubsystemInfo {
  /** Chave do subsistema no `RocketConfig` (e prefixo dos nomes dos campos). */
  key: keyof RocketConfig;
  label: string;
  description: string;
}

/** Subsistemas do `RocketConfig`, na ordem em que aparecem na entrada de
 * dados — ver "Módulos do Back-end e Parâmetros de Entrada" no `AGENTS.md`. */
export const SUBSYSTEMS: readonly SubsystemInfo[] = [
  {
    key: "propulsion",
    label: "Propulsão",
    description:
      "Câmara de combustão, grão propelente, bocal, inércia seca e parâmetros de impulso.",
  },
  {
    key: "avionics",
    label: "Aviônica",
    description: "Massa, dimensões e posição do sistema de aviônica.",
  },
  {
    key: "payload",
    label: "Payload",
    description: "Massa, dimensões e posição do satélite/carga útil.",
  },
  {
    key: "structure",
    label: "Estrutura",
    description: "Massa e geometria global, aerodinâmica, coifa, aletas e rail buttons.",
  },
  {
    key: "recovery",
    label: "Recuperação",
    description: "Paraquedas drogue e main, massas, ejeção e preditivos de voo.",
  },
  {
    key: "environment",
    label: "Ambiente/Localização",
    description: "Coordenadas do local de lançamento, vento e trilho.",
  },
];

/** `id` da seção do subsistema na página, alvo dos links de navegação. */
export function subsystemSectionId(key: keyof RocketConfig): string {
  return `subsystem-${key}`;
}
