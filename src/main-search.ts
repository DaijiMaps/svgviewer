/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-expression-statements */
import { svgMapViewerConfig } from './lib/config'
import { Vec } from './lib/vec'
import { Info } from './main-info'
import SearchWorker from './main-search-worker?worker&inline'

export interface SearchReq {
  p: Vec
  psvg: Vec
}

export interface SearchRes {
  p: Vec
  psvg: Vec
  info: Info
}

const worker = new SearchWorker()

worker.onmessage = (e: Readonly<MessageEvent<null | SearchRes>>) => {
  svgMapViewerConfig.searchDoneCbs.forEach((cb) =>
    cb(
      e.data === null
        ? null
        : { p: e.data.p, psvg: e.data.psvg, info: e.data.info }
    )
  )
}

export function workerSearchStart(p: Vec, psvg: Vec) {
  worker.postMessage({ p, psvg })
}
