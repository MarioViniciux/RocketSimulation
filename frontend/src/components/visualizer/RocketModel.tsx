"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { finOutlinePoints, noseConeRadiusAt } from "@/lib/rocket-geometry";
import type { NoseConeShape, Structure } from "@/types";

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
  profileSegments: number,
  radialSegments: number,
): THREE.LatheGeometry {
  const points: THREE.Vector2[] = [];
  for (let i = 0; i <= profileSegments; i++) {
    const x = (i / profileSegments) * length;
    const radius = Math.max(noseConeRadiusAt(shape, x, length, baseRadius), 0);
    points.push(new THREE.Vector2(radius, -x));
  }
  return new THREE.LatheGeometry(points, radialSegments);
}

function buildFinGeometry(
  rootChord: number,
  tipChord: number,
  semispan: number,
  midChordSweep: number,
): THREE.ExtrudeGeometry {
  const [rootLeadingEdge, rootTrailingEdge, tipTrailingEdge, tipLeadingEdge] = finOutlinePoints({
    root_chord_m: rootChord,
    tip_chord_m: tipChord,
    semispan_m: semispan,
    mid_chord_sweep_m: midChordSweep,
  });
  const shape = new THREE.Shape();
  shape.moveTo(rootLeadingEdge.x, rootLeadingEdge.y);
  shape.lineTo(rootTrailingEdge.x, rootTrailingEdge.y);
  shape.lineTo(tipTrailingEdge.x, tipTrailingEdge.y);
  shape.lineTo(tipLeadingEdge.x, tipLeadingEdge.y);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: FIN_THICKNESS_M, bevelEnabled: false });
}

/** Libera os buffers de GPU de um recurso criado imperativamente (via
 * `useMemo`) quando ele é substituído ou o componente desmonta — o
 * react-three-fiber só descarta automaticamente o que ele próprio cria de
 * forma declarativa (ex.: `<cylinderGeometry />`), não objetos passados
 * por prop (`geometry={...}`, `material={...}`). */
function useDisposable<T extends { dispose: () => void }>(resource: T): T {
  useEffect(() => () => resource.dispose(), [resource]);
  return resource;
}

interface RocketModelProps {
  structure: Structure;
  /** Ver `RenderQuality` (`@/lib/render-quality`). */
  radialSegments: number;
  noseProfileSegments: number;
}

/** Modelo 3D do foguete (corpo, coifa e aletas), com as dimensões,
 * diâmetros e posições relativas do `structure` do `RocketConfig` — ver
 * `app/structure/schemas.py` no backend para a origem de cada campo.
 *
 * Convenção de eixos: eixo Y do corpo do foguete, `y=0` na cauda e
 * `y=total_length_m` na ponta da coifa (mesma referência usada pelo
 * backend para posições ao longo do eixo do foguete).
 *
 * Desempenho: as geometrias dependem só dos campos numéricos que as
 * definem (não da identidade do objeto `structure`, que muda a cada
 * alteração em qualquer campo do formulário), então só são recriadas
 * quando a forma de fato muda; os materiais são criados uma única vez e
 * compartilhados entre as malhas (inclusive entre todas as aletas). */
export function RocketModel({ structure, radialSegments, noseProfileSegments }: RocketModelProps) {
  const bodyRadius = structure.body_diameter_m / 2;
  const noseLength = structure.nose_cone.length_m;
  const noseShape = structure.nose_cone.shape;
  const bodyLength = Math.max(structure.total_length_m - noseLength, 0);
  const bodyCenterY = bodyLength / 2;
  const { root_chord_m, tip_chord_m, semispan_m, mid_chord_sweep_m } = structure.fins;

  const bodyMaterial = useDisposable(
    useMemo(
      () => new THREE.MeshStandardMaterial({ color: BODY_COLOR, roughness: 0.5, metalness: 0.3 }),
      [],
    ),
  );
  const finMaterial = useDisposable(
    useMemo(
      () => new THREE.MeshStandardMaterial({ color: FIN_COLOR, roughness: 0.6, metalness: 0.1 }),
      [],
    ),
  );

  const noseGeometry = useDisposable(
    useMemo(
      () =>
        buildNoseConeGeometry(
          noseShape,
          noseLength,
          bodyRadius,
          noseProfileSegments,
          radialSegments,
        ),
      [noseShape, noseLength, bodyRadius, noseProfileSegments, radialSegments],
    ),
  );

  const finGeometry = useDisposable(
    useMemo(
      () => buildFinGeometry(root_chord_m, tip_chord_m, semispan_m, mid_chord_sweep_m),
      [root_chord_m, tip_chord_m, semispan_m, mid_chord_sweep_m],
    ),
  );

  const finRootLeadingEdgeY =
    structure.total_length_m - structure.fins.root_leading_edge_position_m;
  const finMountingAngleRad = THREE.MathUtils.degToRad(structure.fins.mounting_angle_deg);
  const finIndices = Array.from({ length: structure.fins.count }, (_, index) => index);

  return (
    <group>
      <mesh position={[0, bodyCenterY, 0]} material={bodyMaterial}>
        <cylinderGeometry args={[bodyRadius, bodyRadius, bodyLength, radialSegments]} />
      </mesh>

      <mesh
        geometry={noseGeometry}
        material={bodyMaterial}
        position={[0, structure.total_length_m, 0]}
      />

      {finIndices.map((index) => (
        <group key={index} rotation={[0, (index * 2 * Math.PI) / structure.fins.count, 0]}>
          <group position={[bodyRadius, finRootLeadingEdgeY, 0]}>
            {/* Realinha o plano de projeto da aleta (corda ao longo do
             * corpo, envergadura radial) para a orientação 3D correta. */}
            <group rotation={[0, 0, -Math.PI / 2]}>
              <mesh
                geometry={finGeometry}
                material={finMaterial}
                rotation={[finMountingAngleRad, 0, 0]}
              />
            </group>
          </group>
        </group>
      ))}
    </group>
  );
}
