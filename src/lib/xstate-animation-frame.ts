import { fromCallback } from 'xstate'

// - receives START/STOP
// - sends TICK
export const animationFrameLogic = fromCallback(({ sendBack, receive }) => {
  const x: {
    active: boolean
    id: null | number
  } = {
    active: false,
    id: null,
  }
  const tick = () => {
    if (x.active) {
      sendBack({ type: 'TICK' })
      x.id = requestAnimationFrame(tick)
    }
  }
  const start = () => {
    x.active = true
    if (x.id !== null) {
      cancelAnimationFrame(x.id)
    }
    x.id = requestAnimationFrame(tick)
  }
  const stop = () => {
    x.active = false
    if (x.id !== null) {
      cancelAnimationFrame(x.id)
      x.id = null
    }
  }
  receive((event) => {
    switch (event.type) {
      case 'START':
        start()
        break
      case 'STOP':
        stop()
        break
    }
  })
  return () => stop()
})
