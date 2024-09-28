import { useSelector } from '@xstate/react'
import { useContext } from 'react'
import { openCloseIsVisible } from './lib/open-close'
import { selectShadow } from './lib/react-ui'
import { UiRef } from './lib/xstate-ui'
import './Shadow.css'
import { SvgMapViewerConfigContext } from './svgmapviewer'

export interface ShadowProps {
  _uiRef: UiRef
}

export function Shadow(props: Readonly<ShadowProps>) {
  const config = useContext(SvgMapViewerConfigContext)

  const { _uiRef: uiRef } = props

  const shadow = useSelector(uiRef, selectShadow)

  return !openCloseIsVisible(shadow) ? (
    <></>
  ) : (
    <div
      className="content shadow"
      // eslint-disable-next-line functional/no-return-void
      onClick={() => config.uiCloseCbs.forEach((cb) => cb())}
      // eslint-disable-next-line functional/no-return-void
      onAnimationEnd={() => uiRef.send({ type: 'SHADOW.ANIMATION.END' })}
    ></div>
  )
}

export function ShadowStyle(props: Readonly<ShadowProps>) {
  const { _uiRef: uiRef } = props

  const shadow = useSelector(uiRef, selectShadow)

  if (!shadow.animating) {
    return (
      <style>
        {`
.shadow {
  opacity: 0.3;
}
`}
      </style>
    )
  } else {
    const a = shadow.open ? 0 : 0.3
    const b = shadow.open ? 0.3 : 0

    return (
      <style>
        {`
.shadow {
  will-change: opacity;
  animation: xxx-shadow 300ms ease;
}

@keyframes xxx-shadow {
  from {
    opacity: ${a};
  }
  to {
    opacity: ${b};
  }
}
`}
      </style>
    )
  }
}
