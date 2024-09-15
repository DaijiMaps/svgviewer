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

  const sendWheel = useCallback(
    (ev: WheelEvent) => send({ type: 'WHEEL', ev }),
    [send]
  )

  useEffect(() => {
    const e = containerRef.current
    if (e === null) {
      return
    }
    e.addEventListener('pointerdown', (ev) =>
      send({ type: 'POINTER.DOWN', ev })
    )
    e.addEventListener('pointermove', (ev) =>
      send({ type: 'POINTER.MOVE', ev })
    )
    e.addEventListener('pointerup', (ev) => send({ type: 'POINTER.UP', ev }))
    e.addEventListener('pointercancel', (ev) =>
      send({ type: 'POINTER.CANCEL', ev })
    )
    e.addEventListener('touchstart', (ev) => send({ type: 'TOUCH.START', ev }))
    e.addEventListener('touchmove', (ev) => send({ type: 'TOUCH.MOVE', ev }))
    e.addEventListener('touchend', (ev) => send({ type: 'TOUCH.END', ev }))
    e.addEventListener('touchcancel', (ev) =>
      send({ type: 'TOUCH.CANCEL', ev })
    )
    e.addEventListener('click', (ev) => send({ type: 'CLICK', ev }))
  }, [containerRef, send])

  const mode = useSelector(pointerRef, (snapshot) => snapshot.context.mode)

  useEffect(() => {
    const e = containerRef.current
    if (e === null) {
      return
    }
    if (mode === 0) {
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
