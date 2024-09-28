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

// eslint-disable-next-line functional/no-expression-statements, functional/immutable-data, functional/no-return-void
worker.onmessage = (e: Readonly<MessageEvent<null | SearchRes>>) => {
  // eslint-disable-next-line functional/no-expression-statements, functional/no-return-void
  svgMapViewerConfig.searchDoneCbs.forEach((cb) =>
    cb(
      e.data === null
        ? null
        : { p: e.data.p, psvg: e.data.psvg, info: e.data.info }
    )
  )
}

// eslint-disable-next-line functional/no-return-void
export function workerSearchStart(p: Vec, psvg: Vec) {
  // eslint-disable-next-line functional/no-expression-statements
  worker.postMessage({ p, psvg })
}
