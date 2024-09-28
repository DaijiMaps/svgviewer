import type { SearchReq, SearchRes } from './main-search'

// eslint-disable-next-line functional/no-expression-statements, functional/no-return-void
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

  // eslint-disable-next-line functional/no-expression-statements, functional/no-return-void
  new Promise(() => this.postMessage(!ok ? null : res))
}
