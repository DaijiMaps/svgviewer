import { useContext } from 'react'
import './Footer.css'
import { PointerSend } from './lib/xstate-pointer'
import { SvgViewerConfigContext } from './svgviewer'

interface FooterProps {
  _pointerSend: PointerSend
}

export const Footer = (props: Readonly<FooterProps>) => {
  const config = useContext(SvgViewerConfigContext)

  return (
    <div
      className="footer"
      // eslint-disable-next-line functional/no-return-void
      onClick={() => props._pointerSend({ type: 'DEBUG' })}
    >
      <p>{config.copyright}</p>
    </div>
  )
}
