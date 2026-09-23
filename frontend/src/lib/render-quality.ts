/** Perfil de qualidade da renderização 3D, escolhido uma vez por sessão a
 * partir das capacidades do dispositivo. */
export interface RenderQuality {
  /** Faixa de `devicePixelRatio` aceita pelo `<Canvas>` (`dpr`). */
  dpr: number | [number, number];
  antialias: boolean;
  /** Segmentos ao redor do eixo (corpo e coifa). */
  radialSegments: number;
  /** Segmentos ao longo do perfil da coifa. */
  noseProfileSegments: number;
}

const HIGH_QUALITY: RenderQuality = {
  dpr: [1, 2],
  antialias: true,
  radialSegments: 48,
  noseProfileSegments: 32,
};

/** Dispositivos modestos: o custo dominante é o de preenchimento de pixels
 * (telas de alta densidade com GPU integrada/móvel), então a resolução
 * fica em 1x e sem MSAA; a malha também é reduzida (a silhueta continua
 * suave a essa resolução). */
const LOW_QUALITY: RenderQuality = {
  dpr: 1,
  antialias: false,
  radialSegments: 24,
  noseProfileSegments: 16,
};

const LOW_END_CPU_CORES = 4;
const LOW_END_MEMORY_GB = 4;

/** Heurística de dispositivo modesto: poucos núcleos de CPU, pouca memória
 * (`navigator.deviceMemory`, só em navegadores Chromium) ou modo de
 * economia de dados ativado. Sem acesso ao navegador (SSR),
 * assume qualidade alta — o `<Canvas>` só existe no cliente. */
export function detectRenderQuality(): RenderQuality {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return HIGH_QUALITY;
  }
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const fewCores =
    nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= LOW_END_CPU_CORES;
  const lowMemory = nav.deviceMemory !== undefined && nav.deviceMemory <= LOW_END_MEMORY_GB;
  const saveData = nav.connection?.saveData === true;
  return fewCores || lowMemory || saveData ? LOW_QUALITY : HIGH_QUALITY;
}
