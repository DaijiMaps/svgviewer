import { useMachine, useSelector } from '@xstate/react'
import { useCallback, useEffect } from 'react'
import { SearchRes, svgMapViewerConfig } from './config'
import { selectLayout } from './react-pointer'
import { diag } from './size'
import { PointerRef } from './xstate-pointer'
import { uiMachine, UiState } from './xstate-ui'

export const selectDetail = (ui: UiState) => ui.context.detail
export const selectBalloon = (ui: UiState) => ui.context.balloon
export const selectShadow = (ui: UiState) => ui.context.shadow

export function useUi(pointerRef: PointerRef) {
  const [ui, uiSend, uiRef] = useMachine(uiMachine, {
    input: {
      closeDoneCbs: svgMapViewerConfig.uiCloseDoneCbs,
    },
  })

  const layout = useSelector(pointerRef, selectLayout)

  const uiDetail = useCallback(
    (res: Readonly<null | SearchRes>) => {
      if (res === null) {
        // just ignore
      } else {
        const { p, psvg, info } = res
        const dir = diag(layout.container, p)
        uiSend({ type: 'DETAIL', p, psvg, dir, info: info })
      }
    },
    [layout.container, uiSend]
  )
  const uiOpen = useCallback(
    (ok: boolean) => {
      uiSend({ type: ok ? 'OPEN' : 'CANCEL' })
    },
    [uiSend]
  )
  const uiCancel = useCallback(() => uiSend({ type: 'CANCEL' }), [uiSend])

  useEffect(() => {
    svgMapViewerConfig.searchEndCbs.push(uiDetail)
    svgMapViewerConfig.uiOpenDoneCbs.push(uiOpen)
    svgMapViewerConfig.uiCloseCbs.push(uiCancel)
  }, [uiCancel, uiDetail, uiOpen])

  return { ui, uiSend, uiRef }
}
