"use client";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useDeferredValue, useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { detectRenderQuality } from "@/lib/render-quality";
import type { RocketConfig, Structure } from "@/types";
import { RocketModel } from "./RocketModel";

/** Pede um novo quadro ao reativar o canvas: com `frameloop="demand"`
 * nada é redesenhado até algo invalidar a cena. */
function InvalidateOnActivate({ active }: { active: boolean }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    if (active) {
      invalidate();
    }
  }, [active, invalidate]);
  return null;
}

interface RocketCanvasProps {
  /** `false` enquanto a aba do visualizador está oculta: o canvas continua
   * montado (preserva o contexto WebGL e a câmera), mas não desenha. */
  active: boolean;
}

/** Canvas 3D (Three.js via react-three-fiber), renderizado apenas no
 * cliente (ver `VisualizerPanel`, que carrega este componente com
 * `next/dynamic` e `ssr: false`): WebGL não existe no ambiente de
 * renderização no servidor do Next.js.
 *
 * Acompanha ao vivo só o subsistema `structure` do `RocketConfig` (o único
 * que define a geometria) e enquadra a câmera com base no comprimento
 * total do foguete.
 *
 * Desempenho em dispositivos modestos:
 * - `frameloop="demand"`: a cena é estática, então só é redesenhada quando
 *   algo muda (props da cena ou interação no `OrbitControls`, que já
 *   invalida a cena sozinho, inclusive durante o amortecimento), em vez
 *   de ~60 quadros/s ininterruptos; `"never"` enquanto a aba está oculta.
 * - `useDeferredValue`: reconstruir a geometria nunca atrasa a digitação
 *   nos formulários.
 * - `detectRenderQuality`: resolução (`dpr`), antialiasing e densidade da
 *   malha reduzidos em dispositivos com poucos recursos. */
export function RocketCanvas({ active }: RocketCanvasProps) {
  const { control } = useFormContext<RocketConfig>();
  // Ver `useRocketConfigValues`: todo campo é registrado desde a montagem,
  // então o valor é sempre um `Structure` completo em tempo de execução.
  const liveStructure = useWatch({ control, name: "structure" }) as Structure;
  const structure = useDeferredValue(liveStructure);
  const [quality] = useState(detectRenderQuality);

  const totalLength = structure.total_length_m;
  const centerY = totalLength / 2;
  const cameraDistance = Math.max(totalLength * 1.6, 1.0);

  return (
    <Canvas
      frameloop={active ? "demand" : "never"}
      dpr={quality.dpr}
      gl={{ antialias: quality.antialias, powerPreference: "default" }}
      style={{ position: "absolute", inset: 0, width: "auto", height: "auto" }}
    >
      <InvalidateOnActivate active={active} />
      <PerspectiveCamera
        makeDefault
        position={[cameraDistance, centerY, cameraDistance]}
        fov={45}
        near={0.01}
        far={Math.max(cameraDistance * 20, 100)}
      />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[cameraDistance, totalLength * 1.5, cameraDistance]}
        intensity={1.2}
      />
      <RocketModel
        structure={structure}
        radialSegments={quality.radialSegments}
        noseProfileSegments={quality.noseProfileSegments}
      />
      <OrbitControls
        target={[0, centerY, 0]}
        enableDamping
        minDistance={cameraDistance * 0.1}
        maxDistance={cameraDistance * 4}
      />
    </Canvas>
  );
}
