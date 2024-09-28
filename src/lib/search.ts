import { createActor } from 'xstate'
import { SearchRes, svgMapViewerConfig } from './config'
import { Vec } from './vec'
import { SearchEvent, searchMachine } from './xstate-search'

export const search = createActor(searchMachine, {
  input: {
    // eslint-disable-next-line functional/no-return-void
    startCb: (p, psvg) =>
      // eslint-disable-next-line functional/no-return-void
      svgMapViewerConfig.searchCbs.forEach((cb) => cb(p, psvg)),
    // eslint-disable-next-line functional/no-return-void
    endCb: (p, psvg, info) => {
      // eslint-disable-next-line functional/no-expression-statements, functional/no-return-void
      svgMapViewerConfig.searchEndCbs.forEach((cb) => cb({ p, psvg, info }))
      // eslint-disable-next-line functional/no-expression-statements, functional/no-return-void
      svgMapViewerConfig.uiOpenCbs.forEach((cb) => cb(p, psvg, info))
    },
  },
})

// eslint-disable-next-line functional/no-return-void
export function searchSearchStart(p: Vec, psvg: Vec) {
  // eslint-disable-next-line functional/no-expression-statements
  search.send({ type: 'SEARCH', p, psvg })
}

// eslint-disable-next-line functional/no-return-void
export function searchSearchDone(res: Readonly<null | SearchRes>) {
  // eslint-disable-next-line functional/no-conditional-statements
  if (res === null) {
    const ev: SearchEvent = {
      type: 'SEARCH.CANCEL',
    }
    // eslint-disable-next-line functional/no-expression-statements
    search.send(ev)
    // eslint-disable-next-line functional/no-conditional-statements
  } else {
    const { p, psvg, info } = res
    const ev: SearchEvent = {
      type: 'SEARCH.DONE',
      p,
      psvg,
      info,
    }
    // eslint-disable-next-line functional/no-expression-statements
    search.send(ev)
  }
}

// eslint-disable-next-line functional/no-expression-statements
search.start()
