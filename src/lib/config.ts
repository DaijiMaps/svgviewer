import { Box } from './box/main'

export interface SvgViewerConfig {
  root: string
  map: string
  href: string
  width: number
  height: number
  fontSize: number
  origViewBox: Box
  title: string
  subtitle: string
  copyright: string
  zoomFactor: number
  animationDuration: number
  dragStepAlpha: number
  dragStepStepLimit: number
  dragStepMaxCount: number
}

export type SvgViewerConfigUser = Partial<SvgViewerConfig>

// eslint-disable-next-line functional/no-let, prefer-const
export let svgViewerConfig: SvgViewerConfig = {
  root: 'root',
  map: 'map',
  href: 'map.svg',
  width: 0,
  height: 0,
  fontSize: 16,
  origViewBox: { x: 0, y: 0, width: 0, height: 0 },
  title: 'svgmapviewer',
  subtitle: 'An (opinionated) interactive SVG map viewer',
  copyright: '@ Daiji Maps',
  zoomFactor: 2,
  animationDuration: 625,
  dragStepAlpha: 0.2,
  dragStepStepLimit: 10,
  dragStepMaxCount: 100,
}

export function updateSvgViewerConfig(
  config: Readonly<Partial<SvgViewerConfig>>
  // eslint-disable-next-line functional/no-return-void
): void {
  // eslint-disable-next-line functional/no-expression-statements
  svgViewerConfig = { ...svgViewerConfig, ...config }
}
