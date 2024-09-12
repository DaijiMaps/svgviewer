import './Footer.css'
import { PointerSend } from './lib/xstate-pointer'

interface FooterProps {
  _pointerSend: PointerSend
}

export const Footer = (props: FooterProps) => {
  return (
    <div
      className="footer"
      onClick={() => props._pointerSend({ type: 'DEBUG' })}
    >
      <p>&copy; Daiji Maps</p>
    </div>
  )
}
