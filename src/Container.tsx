import { forwardRef, PropsWithChildren } from 'react'
import './Container.css'
import { PointerSend, PointerState } from './lib/xstate-pointer'

interface ContainerProps {
  _pointer: PointerState
  _pointerSend: PointerSend
}

export const Container = forwardRef<
  HTMLDivElement,
  PropsWithChildren<ContainerProps>
>((props, ref) => {
  return (
    <div ref={ref} className="container">
      {props.children}
    </div>
  )
})
