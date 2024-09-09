import { Cursor } from './Cursor'
import './Guides.css'
import { Layout } from './lib/layout'

export interface GuidesProps {
  _layout: Layout
}

export function Guides(props: GuidesProps) {
  return (
    <svg className="guides">
      <Cursor _layout={props._layout} />
    </svg>
  )
}
