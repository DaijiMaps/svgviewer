import { PropsWithChildren } from 'react'
import './Inner.css'

export const Inner = (props: PropsWithChildren) => {
  return (
    <g id="preview0-root" className="inner preview-root">
      {props.children}
    </g>
  )
}
