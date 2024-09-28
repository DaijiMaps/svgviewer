import { useContext } from 'react'
import './Header.css'
import { PointerSend } from './lib/xstate-pointer'
import { SvgMapViewerConfigContext } from './svgmapviewer'

interface HeaderProps {
  _pointerSend: PointerSend
}

export const Header = (props: Readonly<HeaderProps>) => {
  const config = useContext(SvgMapViewerConfigContext)

  return (
    <div
      // eslint-disable-next-line functional/no-return-void
      onClick={() => props._pointerSend({ type: 'LAYOUT.RESET' })}
      className="header"
    >
      <h2>{config.subtitle}</h2>
      <h1>{config.title}</h1>
    </div>
  )
}
