//import { createBrowserInspector } from '@statelyai/inspect'
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

const selectLayout = (pointer: PointerState) => pointer.context.layout
const selectFocus = (pointer: PointerState) => pointer.context.focus

//const inspector = createBrowserInspector()

export const usePointer = (containerRef: RefObject<HTMLDivElement>) => {
  const body = useWindowResize()

  const [pointer, pointerSend, pointerRef] = useMachine(pointerMachine, {
    input: {
      containerRef,
      layout: makeLayout(configLayout(config.origViewBox, body)),
    },
    //inspect: inspector.inspect,
    inspect: (ev) => {
      if (ev.type === '@xstate.event') {
        if (ev.event.type.match(/^.*(TOUCH|DRAG).*$/)) {
          //console.log('[event]', ev)
        }
        //console.log('[event]', ev)
      }
      if (ev.type === '@xstate.action') {
        //console.log('[action]', ev)
      }
    },
  })

  useEffect(
    () =>
      pointerSend({
        type: 'LAYOUT',
        config: configLayout(config.origViewBox, body),
      }),
    [body, pointerSend]
  )

  const layout = useSelector(pointerRef, selectLayout)
  const focus = useSelector(pointerRef, selectFocus)

  usePointerKey(pointerSend)

  const send = useCallback(
    (event: ReactPointerEvent) => {
      event.ev.preventDefault()
      event.ev.stopPropagation()
      pointerSend(event)
    },
    [pointerSend]
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
    e.addEventListener('wheel', (ev) => send({ type: 'WHEEL', ev }))
    e.addEventListener('click', (ev) => send({ type: 'CLICK', ev }))
  }, [containerRef, send])

  useEffect(() => {
    if (pointer.matches({ expander: 'expanding' })) {
      pointerSend({ type: 'EXPAND.EXPANDED' })
    }
    if (pointer.matches({ expander: 'expanded' })) {
      pointerSend({ type: 'EXPAND.RENDERED' })
    }
    if (pointer.matches({ reflector: 'reflecting' })) {
      pointerSend({ type: 'REFLECT.REFLECTED' })
    }
    if (pointer.matches({ reflector: 'reflected' })) {
      pointerSend({ type: 'REFLECT.RENDERED' })
    }
  }, [pointer, pointerSend])

  return {
    pointer,
    pointerSend,
    pointerRef,
    layout,
    focus,
  }
}
