import { Cursor } from './Cursor'
import './Guides.css'
import { PointerRef } from './lib/xstate-pointer'

export interface GuidesProps {
  _pointerRef: PointerRef
}

export function Guides(props: Readonly<GuidesProps>) {
  return (
    <svg className="guides">
      <Cursor _pointerRef={props._pointerRef} />
    </svg>
  )
}
