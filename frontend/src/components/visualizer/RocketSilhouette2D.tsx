import { useMemo } from "react";
import { finOutlinePoints, noseConeRadiusAt } from "@/lib/rocket-geometry";
import type { RocketConfig } from "@/types";

const PROFILE_SAMPLES = 64;
const MARGIN_FRACTION = 0.15;

const BODY_FILL = "#d4d4d8";
const BODY_STROKE = "#52525b";
const FIN_FILL = "#f97316";
const FIN_STROKE = "#9a3412";

interface AxialPoint {
  /** Distância radial ao eixo do foguete (m). */
  radius: number;
  /** Posição ao longo do eixo do foguete (m); `s=0` na cauda,
   * `s=total_length_m` na ponta da coifa — mesma convenção de
   * `RocketModel` (visualizador 3D). */
  s: number;
}

/** Perfil de um dos lados do corpo (cauda plana + coifa), como uma
 * sequência de pontos (raio, posição axial) da cauda até a ponta. */
export function buildBodyProfile(config: RocketConfig): AxialPoint[] {
  const { structure } = config;
  const bodyRadius = structure.body_diameter_m / 2;
  const noseLength = structure.nose_cone.length_m;
  const bodyLength = Math.max(structure.total_length_m - noseLength, 0);
  const totalLength = structure.total_length_m;

  const points: AxialPoint[] = [
    { radius: 0, s: 0 },
    { radius: bodyRadius, s: 0 },
    { radius: bodyRadius, s: bodyLength },
  ];

  for (let i = 1; i <= PROFILE_SAMPLES; i++) {
    // vai da base da coifa (x = noseLength) até a ponta (x = 0).
    const x = noseLength * (1 - i / PROFILE_SAMPLES);
    const s = totalLength - x;
    const radius = Math.max(
      noseConeRadiusAt(structure.nose_cone.shape, x, noseLength, bodyRadius),
      0,
    );
    points.push({ radius, s });
  }

  return points;
}

/** Caminho SVG fechado da silhueta do corpo (mirror do perfil nos dois
 * lados do eixo). Eixo Y do SVG invertido (`y = -s`) para que a ponta da
 * coifa fique no topo do desenho. */
export function buildBodyPath(config: RocketConfig): string {
  const profile = buildBodyProfile(config);
  const rightSide = profile.map((p) => ({ x: p.radius, y: -p.s }));
  const leftSide = [...profile]
    .reverse()
    .slice(1)
    .map((p) => ({ x: -p.radius, y: -p.s }));
  const outline = [...rightSide, ...leftSide];
  const [first, ...rest] = outline;
  const segments = rest.map((p) => `L ${p.x} ${p.y}`).join(" ");
  return `M ${first.x} ${first.y} ${segments} Z`;
}

/** Caminho SVG fechado do contorno trapezoidal de uma aleta, espelhado
 * (`mirror = 1` à direita do corpo, `mirror = -1` à esquerda) — uma
 * representação esquemática simplificada (não uma projeção 3D exata),
 * suficiente para indicar quantidade/posição/forma das aletas na vista
 * lateral. */
export function buildFinPath(config: RocketConfig, mirror: 1 | -1): string {
  const { structure } = config;
  const bodyRadius = structure.body_diameter_m / 2;
  const finRootLeadingEdgeS =
    structure.total_length_m - structure.fins.root_leading_edge_position_m;

  const toPoint = (point: { x: number; y: number }) => {
    const s = finRootLeadingEdgeS - point.x;
    const radial = bodyRadius + point.y;
    return { x: mirror * radial, y: -s };
  };

  const [rootLeadingEdge, rootTrailingEdge, tipTrailingEdge, tipLeadingEdge] = finOutlinePoints(
    structure.fins,
  ).map(toPoint);

  return (
    `M ${rootLeadingEdge.x} ${rootLeadingEdge.y} ` +
    `L ${rootTrailingEdge.x} ${rootTrailingEdge.y} ` +
    `L ${tipTrailingEdge.x} ${tipTrailingEdge.y} ` +
    `L ${tipLeadingEdge.x} ${tipLeadingEdge.y} Z`
  );
}

interface RocketSilhouette2DProps {
  config: RocketConfig;
}

/** Vista lateral 2D do foguete (silhueta do corpo + coifa + aletas),
 * como fallback leve e fluido do visualizador 3D: puro SVG declarativo,
 * sem WebGL e compatível com renderização no servidor. Reaproveita a
 * mesma matemática de geometria pura de `RocketModel` (visualizador 3D)
 * via `@/lib/rocket-geometry`. */
export function RocketSilhouette2D({ config }: RocketSilhouette2DProps) {
  const { structure } = config;
  const bodyRadius = structure.body_diameter_m / 2;
  const halfWidth = bodyRadius + structure.fins.semispan_m;
  const totalLength = structure.total_length_m;

  const bodyPath = useMemo(() => buildBodyPath(config), [config]);
  const finPathRight = useMemo(() => buildFinPath(config, 1), [config]);
  const finPathLeft = useMemo(() => buildFinPath(config, -1), [config]);

  const marginX = halfWidth * MARGIN_FRACTION + 0.01;
  const marginY = totalLength * 0.02;
  const strokeWidth = totalLength * 0.002;

  const viewBox = [
    -(halfWidth + marginX),
    -(totalLength + marginY),
    2 * (halfWidth + marginX),
    totalLength + 2 * marginY,
  ].join(" ");

  return (
    <svg
      viewBox={viewBox}
      className="h-full w-full"
      role="img"
      aria-label="Silhueta 2D do foguete (vista lateral)"
    >
      <path d={finPathLeft} fill={FIN_FILL} stroke={FIN_STROKE} strokeWidth={strokeWidth} />
      <path d={finPathRight} fill={FIN_FILL} stroke={FIN_STROKE} strokeWidth={strokeWidth} />
      <path d={bodyPath} fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth={strokeWidth} />
    </svg>
  );
}
