/* eslint-disable functional/no-expression-statements */
/* eslint-disable functional/no-let */
/* eslint-disable functional/no-mixed-types */
/* eslint-disable functional/no-return-void */
/* eslint-disable prettier/prettier */
import { createElement } from 'react'
import { Box } from './box/main'
import { Vec } from './vec'

interface Info {
  title: string
}

export type { Info }

export interface SearchReq {
  p: Vec
  psvg: Vec
}

export interface SearchRes {
  p: Vec
  psvg: Vec
  info: Readonly<Info>
}

export type SearchCb = (client: Vec, svg: Vec) => void

export type SearchDoneCb = (res: Readonly<null | SearchRes>) => void

export type UiOpenCb = (p: Vec, psvg: Vec, info: Readonly<Info>) => void

export type UiOpenDoneCb = (ok: boolean) => void

export type UiCloseCb = () => void

export type RenderInfo = (props: Readonly<{ info: Info }>) => JSX.Element

export interface SvgMapViewerConfig {
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
  searchStartCbs: SearchCb[]
  searchCbs: SearchCb[]
  searchDoneCbs: SearchDoneCb[]
  searchEndCbs: SearchDoneCb[]
  uiOpenCbs: UiOpenCb[]
  uiOpenDoneCbs: UiOpenDoneCb[]
  uiCloseCbs: UiCloseCb[]
  uiCloseDoneCbs: UiCloseCb[]
  renderInfo: RenderInfo
}

export type SvgMapViewerConfigUser = Partial<SvgMapViewerConfig>

type SvgMapViewerConfigBase = SvgMapViewerConfig

const renderInfoDefault: RenderInfo = (props: Readonly<{ info: Info }>) =>
  createElement('p', {}, props.info.title)

export let svgMapViewerConfig: SvgMapViewerConfig = {
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
  searchStartCbs: [],
  searchCbs: [],
  searchDoneCbs: [],
  searchEndCbs: [],
  uiOpenCbs: [],
  uiOpenDoneCbs: [],
  uiCloseCbs: [],
  uiCloseDoneCbs: [],
  renderInfo: renderInfoDefault,
}

export function updateSvgMapViewerConfig(
  config: Readonly<Partial<SvgMapViewerConfig>>
): void {
  svgMapViewerConfig = {
    ...svgMapViewerConfig,
    ...(config as SvgMapViewerConfigBase),
  }
}

export function getSvgMapViewerConfig() {
  return svgMapViewerConfig
}
