"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { finOutlinePoints, noseConeRadiusAt } from "@/lib/rocket-geometry";
import type { Fins, NoseConeShape, RocketConfig } from "@/types";

const RADIAL_SEGMENTS = 48;
const NOSE_PROFILE_SEGMENTS = 32;
/** As aletas não têm campo de espessura no schema; usa-se um valor fixo
 * pequeno só para dar volume visual ao painel (puramente estético). */
const FIN_THICKNESS_M = 0.003;

const BODY_COLOR = "#d4d4d8";
const FIN_COLOR = "#f97316";

/** Geometria de revolução da coifa. O perfil é construído com `y=0` na
 * ponta e `y=-length` na base, para que, posicionada em
 * `y = total_length_m` (o topo do foguete), a base coincida exatamente
 * com o topo do corpo (`y = body_length_m`). */
function buildNoseConeGeometry(
  shape: NoseConeShape,
  length: number,
  baseRadius: number,
): THREE.LatheGeometry {
  const points: THREE.Vector2[] = [];
  for (let i = 0; i <= NOSE_PROFILE_SEGMENTS; i++) {
    const x = (i / NOSE_PROFILE_SEGMENTS) * length;
    const radius = Math.max(noseConeRadiusAt(shape, x, length, baseRadius), 0);
    points.push(new THREE.Vector2(radius, -x));
  }
  return new THREE.LatheGeometry(points, RADIAL_SEGMENTS);
}

function buildFinShape(fins: Fins): THREE.Shape {
  const [rootLeadingEdge, rootTrailingEdge, tipTrailingEdge, tipLeadingEdge] =
    finOutlinePoints(fins);
  const shape = new THREE.Shape();
  shape.moveTo(rootLeadingEdge.x, rootLeadingEdge.y);
  shape.lineTo(rootTrailingEdge.x, rootTrailingEdge.y);
  shape.lineTo(tipTrailingEdge.x, tipTrailingEdge.y);
  shape.lineTo(tipLeadingEdge.x, tipLeadingEdge.y);
  shape.closePath();
  return shape;
}

interface RocketModelProps {
  config: RocketConfig;
}

/** Modelo 3D do foguete (corpo, coifa e aletas), com as dimensões,
 * diâmetros e posições relativas do `structure` do `RocketConfig` — ver
 * `app/structure/schemas.py` no backend para a origem de cada campo.
 *
 * Convenção de eixos: eixo Y do corpo do foguete, `y=0` na cauda e
 * `y=total_length_m` na ponta da coifa (mesma referência usada pelo
 * backend para posições ao longo do eixo do foguete). */
export function RocketModel({ config }: RocketModelProps) {
  const { structure } = config;
  const bodyRadius = structure.body_diameter_m / 2;
  const noseLength = structure.nose_cone.length_m;
  const bodyLength = Math.max(structure.total_length_m - noseLength, 0);
  const bodyCenterY = bodyLength / 2;

  const noseGeometry = useMemo(
    () => buildNoseConeGeometry(structure.nose_cone.shape, noseLength, bodyRadius),
    [structure.nose_cone.shape, noseLength, bodyRadius],
  );

  const finGeometry = useMemo(() => {
    const shape = buildFinShape(structure.fins);
    return new THREE.ExtrudeGeometry(shape, { depth: FIN_THICKNESS_M, bevelEnabled: false });
  }, [structure.fins]);

  const finRootLeadingEdgeY = structure.total_length_m - structure.fins.root_leading_edge_position_m;
  const finMountingAngleRad = THREE.MathUtils.degToRad(structure.fins.mounting_angle_deg);
  const finIndices = Array.from({ length: structure.fins.count }, (_, index) => index);

  return (
    <group>
      <mesh position={[0, bodyCenterY, 0]}>
        <cylinderGeometry args={[bodyRadius, bodyRadius, bodyLength, RADIAL_SEGMENTS]} />
        <meshStandardMaterial color={BODY_COLOR} roughness={0.5} metalness={0.3} />
      </mesh>

      <mesh geometry={noseGeometry} position={[0, structure.total_length_m, 0]}>
        <meshStandardMaterial color={BODY_COLOR} roughness={0.5} metalness={0.3} />
      </mesh>

      {finIndices.map((index) => (
        <group key={index} rotation={[0, (index * 2 * Math.PI) / structure.fins.count, 0]}>
          <group position={[bodyRadius, finRootLeadingEdgeY, 0]}>
            {/* Realinha o plano de projeto da aleta (corda ao longo do
             * corpo, envergadura radial) para a orientação 3D correta. */}
            <group rotation={[0, 0, -Math.PI / 2]}>
              <mesh geometry={finGeometry} rotation={[finMountingAngleRad, 0, 0]}>
                <meshStandardMaterial color={FIN_COLOR} roughness={0.6} metalness={0.1} />
              </mesh>
            </group>
          </group>
        </group>
      ))}
    </group>
  );
}
