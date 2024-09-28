/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-expression-statements */
import type { SearchReq, SearchRes } from './main-search'

onmessage = function (e: Readonly<MessageEvent<SearchReq>>) {
  const p = e.data.p
  const psvg = e.data.psvg

  // XXX search nearest shop by point
  // XXX search shop info by point

  const ok = Math.round(e.timeStamp) % 5 == 0

  const res: SearchRes = {
    p,
    psvg,
    info: {
      title: `Found: POI: ${p.x},${p.y} (${psvg.x},${psvg.y})`,
      x: {
        tag: 'shop',
        name: 'Test',
        address: 'A1-1-1',
      },
    },
  }

  new Promise(() => this.postMessage(!ok ? null : res))
}
