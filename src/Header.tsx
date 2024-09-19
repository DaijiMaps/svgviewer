import { useContext } from 'react'
import './Header.css'
import { PointerSend } from './lib/xstate-pointer'
import { SvgViewerConfigContext } from './svgviewer'

interface HeaderProps {
  _pointerSend: PointerSend
}

export const Header = (props: Readonly<HeaderProps>) => {
  const config = useContext(SvgViewerConfigContext)

  return (
    <div
      className="header"
      // eslint-disable-next-line functional/no-return-void
      onClick={() => props._pointerSend({ type: 'LAYOUT.RESET' })}
    >
      <h2>{config.subtitle}</h2>
      <h1>{config.title}</h1>
    </div>
  )
}
