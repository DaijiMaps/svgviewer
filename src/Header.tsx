import './Header.css'
import { PointerSend } from './lib/xstate-pointer'

interface HeaderProps {
  _pointerSend: PointerSend
}

export const Header = (props: Readonly<HeaderProps>) => {
  return (
    <div
      className="header"
      // eslint-disable-next-line functional/no-return-void
      onClick={() => props._pointerSend({ type: 'LAYOUT.RESET' })}
    >
      <h1>Daiji Maps SVG Viewer</h1>
      <h2>Demo</h2>
    </div>
  )
}
