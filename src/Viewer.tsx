import { PropsWithChildren, useRef } from 'react'
import { Container } from './Container'
import { Debug } from './Debug'
import { Footer } from './Footer'
import { Guides } from './Guides'
import { Header } from './Header'
import { usePointer } from './lib/react-pointer'
import { dragStyle, modeStyle, moveStyle, zoomStyle } from './lib/style'
import { Svg } from './Svg'

export const Viewer = (props: Readonly<PropsWithChildren>) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const { pointer, pointerSend, pointerRef, layout, touches } =
    usePointer(containerRef)

  return (
    <>
      <Container ref={containerRef}>
        <Svg
          width={layout.scroll.width}
          height={layout.scroll.height}
          // eslint-disable-next-line functional/no-return-void
          onAnimationEnd={() => pointerSend({ type: 'ANIMATION.END' })}
          _viewBox={layout.svg}
        >
          {props.children}
        </Svg>
      </Container>
      <Guides _pointerRef={pointerRef} />
      {pointer.context.debug && (
        <Debug
          _container={containerRef.current}
          _pointer={pointer}
          _touches={touches}
        />
      )}
      <style>
        {modeStyle(pointer)}
        {dragStyle(pointer)}
        {moveStyle(pointer)}
        {zoomStyle(pointer)}
      </style>
      <Header _pointerSend={pointerSend} />
      <Footer _pointerSend={pointerSend} />
    </>
  )
}
