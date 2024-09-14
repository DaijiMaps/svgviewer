import './Footer.css'
import { PointerSend } from './lib/xstate-pointer'

interface FooterProps {
  _pointerSend: PointerSend
}

export const Footer = (props: Readonly<FooterProps>) => {
  return (
    <div
      className="footer"
      // eslint-disable-next-line functional/no-return-void
      onClick={() => props._pointerSend({ type: 'DEBUG' })}
    >
      <p>&copy; Daiji Maps</p>
    </div>
  )
}
