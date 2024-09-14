import { forwardRef, PropsWithChildren } from 'react'
import './Container.css'

export const Container = forwardRef<HTMLDivElement, PropsWithChildren>(
  (props, ref) => {
    return (
      <div ref={ref} className="container">
        {props.children}
      </div>
    )
  }
)
