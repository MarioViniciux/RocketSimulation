"use client";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRocketConfigValues } from "@/lib/use-rocket-config-values";
import { RocketModel } from "./RocketModel";

/** Canvas 3D (Three.js via react-three-fiber), renderizado apenas no
 * cliente (ver `VisualizerPanel`, que carrega este componente com
 * `next/dynamic` e `ssr: false`): WebGL não existe no ambiente de
 * renderização no servidor do Next.js.
 *
 * Lê o `RocketConfig` ao vivo via `useRocketConfigValues` para que o
 * modelo 3D acompanhe as dimensões informadas nos formulários de entrada,
 * e enquadra a câmera com base no comprimento total do foguete. */
export function RocketCanvas() {
  const config = useRocketConfigValues();
  const totalLength = config.structure.total_length_m;
  const centerY = totalLength / 2;
  const cameraDistance = Math.max(totalLength * 1.6, 1.0);

  return (
    <Canvas className="h-full w-full">
      <PerspectiveCamera
        makeDefault
        position={[cameraDistance, centerY, cameraDistance]}
        fov={45}
        near={0.01}
        far={Math.max(cameraDistance * 20, 100)}
      />
      <ambientLight intensity={0.6} />
      <directionalLight position={[cameraDistance, totalLength * 1.5, cameraDistance]} intensity={1.2} />
      <RocketModel config={config} />
      <OrbitControls target={[0, centerY, 0]} enableDamping />
    </Canvas>
  );
}
