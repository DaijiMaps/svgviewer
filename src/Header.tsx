import './Header.css'
import { PointerSend } from './lib/xstate-pointer'

interface HeaderProps {
  _pointerSend: PointerSend
}

export const Header = (props: HeaderProps) => {
  return (
    <div
      className="header"
      onClick={() => props._pointerSend({ type: 'LAYOUT.RESET' })}
    >
      <h1>Daiji Maps SVG Viewer</h1>
      <h2>Demo</h2>
    </div>
  )
}
