import { useMachine, useSelector } from '@xstate/react'
import { RefObject, useCallback, useContext, useEffect } from 'react'
import { SvgMapViewerConfigContext } from '../svgmapviewer'
import { getSvgMapViewerConfig, svgMapViewerConfig } from './config'
import { configLayout, makeLayout } from './layout'
import { useWindowResize } from './react-resize'
import { Vec } from './vec'
import {
  pointerMachine,
  PointerSend,
  PointerState,
  ReactPointerEvent,
} from './xstate-pointer'

let pointereventmask: boolean = false
let toucheventmask: boolean = false
let wheeleventmask: boolean = false
let clickeventmask: boolean = false

export const selectMode = (pointer: PointerState) => pointer.context.mode
export const selectLayout = (pointer: PointerState) => pointer.context.layout
export const selectFocus = (pointer: PointerState) => pointer.context.focus
export const selectTouches = (pointer: PointerState) => pointer.context.touches
export const selectLocked = (pointer: PointerState) => pointer.context.locked

const usePointerKey = (send: PointerSend) => {
  const keyDown = useCallback(
    (ev: KeyboardEvent) => send({ type: 'KEY.DOWN', ev }),
    [send]
  )
  const keyUp = useCallback(
    (ev: KeyboardEvent) => send({ type: 'KEY.UP', ev }),
    [send]
  )

  useEffect(() => {
    const add = document.body.addEventListener
    const remove = document.body.removeEventListener
    add('keydown', keyDown)
    add('keyup', keyUp)
    return () => {
      remove('keydown', keyDown)
      remove('keyup', keyUp)
    }
  }, [keyDown, keyUp, send])
}

export const usePointer = (containerRef: RefObject<HTMLDivElement>) => {
  const body = useWindowResize()
  const config = useContext(SvgMapViewerConfigContext)

  const [pointer, pointerSend, pointerRef] = useMachine(pointerMachine, {
    input: {
      containerRef,
      layout: makeLayout(
        configLayout(config.fontSize, config.origViewBox, body)
      ),
      searchCb: (p: Vec, psvg: Vec) =>
        getSvgMapViewerConfig().searchStartCbs.forEach((cb) => cb(p, psvg)),
      lockCb: (ok: boolean) =>
        getSvgMapViewerConfig().uiOpenDoneCbs.forEach((cb) => cb(ok)),
    },
  })

  const pointerSearchLock = useCallback(
    (p: Vec, psvg: Vec) => pointerSend({ type: 'SEARCH.LOCK', p, psvg }),
    [pointerSend]
  )
  const pointerSearchUnlock = useCallback(
    () => pointerSend({ type: 'SEARCH.UNLOCK' }),
    [pointerSend]
  )

  useEffect(() => {
    svgMapViewerConfig.uiOpenCbs.push(pointerSearchLock)
    svgMapViewerConfig.uiCloseDoneCbs.push(pointerSearchUnlock)
  }, [pointerSearchLock, pointerSearchUnlock])

  useEffect(() => {
    const style = getComputedStyle(document.body)

    pointerSend({
      type: 'LAYOUT',
      config: configLayout(
        parseFloat(style.fontSize),
        config.origViewBox,
        body
      ),
    })
  }, [body, config.origViewBox, pointerSend])

  usePointerKey(pointerSend)

  const send = useCallback(
    (
      event: ReactPointerEvent,
      options?: {
        preventDefault?: boolean
        stopPropagation?: boolean
      }
    ) => {
      if (options?.preventDefault === false) {
        // skip
      } else {
        event.ev.preventDefault()
      }
      if (options?.stopPropagation === false) {
        // skip
      } else {
        event.ev.stopPropagation()
      }
      pointerSend(event)
    },
    [pointerSend]
  )

  const sendPointerDown = useCallback(
    (ev: PointerEvent) => send({ type: 'POINTER.DOWN', ev }),
    [send]
  )
  const sendPointerMove = useCallback(
    (ev: PointerEvent) => send({ type: 'POINTER.MOVE', ev }),
    [send]
  )
  const sendPointerUp = useCallback(
    (ev: PointerEvent) => {
      if (pointereventmask) {
        return
      }
      send({ type: 'POINTER.UP', ev })
    },
    [send]
  )
  const sendTouchStart = useCallback(
    (ev: TouchEvent) => {
      if (toucheventmask) {
        return
      }
      // skip preventDefault to enable emulated "click"
      send({ type: 'TOUCH.START', ev }, { preventDefault: false })
    },
    [send]
  )
  const sendTouchMove = useCallback(
    (ev: TouchEvent) => {
      if (toucheventmask) {
        return
      }
      send({ type: 'TOUCH.MOVE', ev })
    },
    [send]
  )
  const sendTouchEnd = useCallback(
    (ev: TouchEvent) => {
      if (toucheventmask) {
        return
      }
      // skip preventDefault to enable emulated "click"
      send({ type: 'TOUCH.END', ev }, { preventDefault: false })
    },
    [send]
  )
  const sendClick = useCallback(
    (ev: MouseEvent) => {
      if (clickeventmask) {
        return
      }
      send({ type: 'CLICK', ev })
    },
    [send]
  )
  const sendContextMenuu = useCallback(
    (ev: MouseEvent) => send({ type: 'CONTEXTMENU', ev }),
    [send]
  )
  const sendWheel = useCallback(
    (ev: WheelEvent) => {
      if (wheeleventmask) {
        return
      }
      send({ type: 'WHEEL', ev })
    },
    [send]
  )

  useEffect(() => {
    const e = containerRef.current
    if (e === null) {
      return
    }
    e.removeEventListener('pointerdown', sendPointerDown)
    e.removeEventListener('pointermove', sendPointerMove)
    e.removeEventListener('pointerup', sendPointerUp)
    e.removeEventListener('touchstart', sendTouchStart)
    e.removeEventListener('touchmove', sendTouchMove)
    e.removeEventListener('touchend', sendTouchEnd)
    e.removeEventListener('click', sendClick)
    e.removeEventListener('contextmenu', sendContextMenuu)
    e.removeEventListener('wheel', sendWheel)
    e.addEventListener('pointerdown', sendPointerDown)
    e.addEventListener('pointermove', sendPointerMove)
    e.addEventListener('pointerup', sendPointerUp)
    e.addEventListener('touchstart', sendTouchStart)
    e.addEventListener('touchmove', sendTouchMove)
    e.addEventListener('touchend', sendTouchEnd)
    e.addEventListener('click', sendClick)
    e.addEventListener('contextmenu', sendContextMenuu)
    e.addEventListener('wheel', sendWheel)
  }, [
    containerRef,
    sendClick,
    sendContextMenuu,
    sendPointerDown,
    sendPointerMove,
    sendPointerUp,
    sendTouchEnd,
    sendTouchMove,
    sendTouchStart,
    sendWheel,
  ])

  const mode = useSelector(pointerRef, selectMode)

  useEffect(() => {
    const e = containerRef.current
    if (e === null) {
      return
    }
    pointereventmask = mode !== 0
    toucheventmask = mode !== 0
    wheeleventmask = mode !== 0
  }, [containerRef, mode, sendWheel])

  const locked = useSelector(pointerRef, selectLocked)

  useEffect(() => {
    const e = containerRef.current
    if (e === null) {
      return
    }
    pointereventmask = locked
    toucheventmask = locked
    wheeleventmask = locked
    clickeventmask = locked
  }, [containerRef, locked])

  useEffect(() => {
    if (pointer.hasTag('rendering')) {
      pointerSend({ type: 'RENDERED' })
    }
  }, [pointer, pointerSend])

  return {
    pointer,
    pointerSend,
    pointerRef,
    layout: useSelector(pointerRef, selectLayout),
    focus: useSelector(pointerRef, selectFocus),
    touches: useSelector(pointerRef, selectTouches),
  }
}
