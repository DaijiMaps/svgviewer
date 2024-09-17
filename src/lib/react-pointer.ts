import { useMachine, useSelector } from '@xstate/react'
import { RefObject, useCallback, useEffect } from 'react'
import { config } from './config'
import { configLayout, makeLayout } from './layout'
import { useWindowResize } from './react-resize'
import {
  pointerMachine,
  PointerSend,
  PointerState,
  ReactPointerEvent,
} from './xstate-pointer'

const selectLayout = (pointer: PointerState) => pointer.context.layout
const selectFocus = (pointer: PointerState) => pointer.context.focus
const selectTouches = (pointer: PointerState) => pointer.context.touches

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

  const [pointer, pointerSend, pointerRef] = useMachine(pointerMachine, {
    input: {
      containerRef,
      layout: makeLayout(
        configLayout(config.FONT_SIZE, config.origViewBox, body)
      ),
    },
  })

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
  }, [body, pointerSend])

  usePointerKey(pointerSend)

  const send = useCallback(
    (event: ReactPointerEvent) => {
      event.ev.preventDefault()
      event.ev.stopPropagation()
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
    (ev: PointerEvent) => send({ type: 'POINTER.UP', ev }),
    [send]
  )
  const sendTouchStart = useCallback(
    (ev: TouchEvent) => send({ type: 'TOUCH.START', ev }),
    [send]
  )
  const sendTouchMove = useCallback(
    (ev: TouchEvent) => send({ type: 'TOUCH.MOVE', ev }),
    [send]
  )
  const sendTouchEnd = useCallback(
    (ev: TouchEvent) => send({ type: 'TOUCH.END', ev }),
    [send]
  )
  const sendClick = useCallback(
    (ev: MouseEvent) => send({ type: 'CLICK', ev }),
    [send]
  )
  const sendContextMenuu = useCallback(
    (ev: MouseEvent) => send({ type: 'CONTEXTMENU', ev }),
    [send]
  )
  const sendWheel = useCallback(
    (ev: WheelEvent) => send({ type: 'WHEEL', ev }),
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
    e.addEventListener('pointerdown', sendPointerDown)
    e.addEventListener('pointermove', sendPointerMove)
    e.addEventListener('pointerup', sendPointerUp)
    e.addEventListener('touchstart', sendTouchStart)
    e.addEventListener('touchmove', sendTouchMove)
    e.addEventListener('touchend', sendTouchEnd)
    e.addEventListener('click', sendClick)
    e.addEventListener('contextmenu', sendContextMenuu)
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
  ])

  const mode = useSelector(pointerRef, (snapshot) => snapshot.context.mode)

  useEffect(() => {
    const e = containerRef.current
    if (e === null) {
      return
    }
    if (mode === 0) {
      e.removeEventListener('wheel', sendWheel)
      e.addEventListener('wheel', sendWheel)
    } else {
      e.removeEventListener('wheel', sendWheel)
    }
  }, [containerRef, mode, sendWheel])

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
