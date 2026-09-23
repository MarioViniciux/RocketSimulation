"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

/** Placeholder giratório, só para provar que o pipeline WebGL/Three.js
 * está configurado e renderizando. A geometria real do foguete, a partir
 * das dimensões informadas nos formulários, é a próxima etapa (Fase 7). */
function PlaceholderMesh() {
  return (
    <mesh rotation={[0.4, 0.6, 0]}>
      <torusKnotGeometry args={[0.8, 0.25, 128, 16]} />
      <meshStandardMaterial color="#f97316" />
    </mesh>
  );
}

/** Canvas 3D (Three.js via react-three-fiber). Renderizado apenas no
 * cliente (ver `VisualizerPanel`, que carrega este componente com
 * `next/dynamic` e `ssr: false`): WebGL não existe no ambiente de
 * renderização no servidor do Next.js. */
export function RocketCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 50 }} className="h-full w-full">
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 5]} intensity={1.2} />
      <PlaceholderMesh />
      <OrbitControls enableDamping />
    </Canvas>
  );
}
