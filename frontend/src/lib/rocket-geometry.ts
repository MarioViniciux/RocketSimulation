import { NoseConeShape } from "@/types";
import type { Fins } from "@/types";

/** Raio da coifa a uma distância `x` da ponta (0 <= x <= length), para um
 * comprimento e raio de base dados, conforme o formato (`NoseConeShape`).
 * Pura (sem Three.js) para ser reaproveitada tanto pelo visualizador 3D
 * quanto pelo 2D (mesma silhueta lateral do foguete).
 *
 * Ogival: fórmula da ogiva tangente clássica. Parabólica: série de
 * potência com K'=1 (parábola cheia). Cônica: reta (interpolação linear). */
export function noseConeRadiusAt(
  shape: NoseConeShape,
  x: number,
  length: number,
  baseRadius: number,
): number {
  if (length <= 0) {
    return baseRadius;
  }
  const t = x / length;
  switch (shape) {
    case NoseConeShape.CONICAL:
      return baseRadius * t;
    case NoseConeShape.PARABOLIC:
      return baseRadius * (2 * t - t * t);
    case NoseConeShape.OGIVAL:
    default: {
      const rho = (baseRadius ** 2 + length ** 2) / (2 * baseRadius);
      return Math.sqrt(Math.max(rho ** 2 - (length - x) ** 2, 0)) + baseRadius - rho;
    }
  }
}

export interface Point2D {
  x: number;
  y: number;
}

/** Os 4 vértices do contorno trapezoidal da aleta, no plano de projeto
 * (x = sentido da corda, ao longo do corpo; y = envergadura, radialmente
 * para fora do corpo): bordo de ataque da raiz, bordo de fuga da raiz,
 * bordo de fuga da ponta, bordo de ataque da ponta, nessa ordem (forma um
 * polígono fechado). Pura (sem Three.js), pelo mesmo motivo de
 * `noseConeRadiusAt`. */
export function finOutlinePoints(fins: Fins): [Point2D, Point2D, Point2D, Point2D] {
  return [
    { x: 0, y: 0 },
    { x: fins.root_chord_m, y: 0 },
    { x: fins.mid_chord_sweep_m + fins.tip_chord_m, y: fins.semispan_m },
    { x: fins.mid_chord_sweep_m, y: fins.semispan_m },
  ];
}
