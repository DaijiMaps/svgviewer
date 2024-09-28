import { PropsWithChildren, useRef } from 'react'
import { BalloonStyle } from './Balloon'
import { Container } from './Container'
import { Debug } from './Debug'
import { Detail } from './Detail'
import { Footer } from './Footer'
import { Guides } from './Guides'
import { Header } from './Header'
import { usePointer } from './lib/react-pointer'
import { useUi } from './lib/react-ui'
import { search } from './lib/search'
import {
  dragStyle,
  modeStyle,
  moveStyle,
  scrollStyle,
  zoomStyle,
} from './lib/style'
import { Shadow, ShadowStyle } from './Shadow'
import { Svg } from './Svg'

export const Viewer = (props: Readonly<PropsWithChildren>) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const { pointer, pointerSend, pointerRef, layout, touches } =
    usePointer(containerRef)

  const { ui, uiRef } = useUi(pointerRef)

  // XXX pointer === Locked
  // XXX ui === Detail

  return (
    <>
      <Container ref={containerRef}>
        <Svg
          // eslint-disable-next-line functional/no-return-void
          onAnimationEnd={() => pointerSend({ type: 'ANIMATION.END' })}
          _viewBox={layout.svg}
        >
          {props.children}
        </Svg>
        <Shadow _uiRef={uiRef} />
        <Detail _pointerRef={pointerRef} _uiRef={uiRef} />
      </Container>
      <Guides _pointerRef={pointerRef} />
      {pointer.context.debug && (
        <Debug
          _container={containerRef.current}
          _ui={ui}
          _pointer={pointer}
          _touches={touches}
          _search={search.getSnapshot()}
        />
      )}
      <Header _pointerSend={pointerSend} />
      <Footer _pointerSend={pointerSend} />
      <style>
        {scrollStyle(layout)}
        {modeStyle(pointer)}
        {dragStyle(pointer)}
        {moveStyle(pointer)}
        {zoomStyle(pointer)}
      </style>
      <ShadowStyle _uiRef={uiRef} />
      <BalloonStyle _uiRef={uiRef} />
    </>
  )
}
