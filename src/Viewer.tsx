import { PropsWithChildren, useRef } from 'react'
import { Container } from './Container'
import { Debug } from './Debug'
import { Footer } from './Footer'
import { Guides } from './Guides'
import { Header } from './Header'
import { usePointer } from './lib/react-pointer'
import { dragStyle, moveStyle, zoomStyle } from './lib/style'
import { Svg } from './Svg'

export const Viewer = (props: PropsWithChildren) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const { pointer, pointerSend, layout, focus } = usePointer(containerRef)

  return (
    <>
      <Container
        ref={containerRef}
        _pointer={pointer}
        _pointerSend={pointerSend}
      >
        <Svg
          width={layout.container.width}
          height={layout.container.height}
          onAnimationEnd={() => pointerSend({ type: 'ANIMATION.END' })}
          _viewBox={layout.svg}
        >
          {props.children}
        </Svg>
      </Container>
      <Guides _layout={layout} _focus={focus} />
      {pointer.context.debug && (
        <Debug _pointer={pointer} _container={containerRef.current} />
      )}
      <style>
        {dragStyle(pointer)}
        {moveStyle(pointer)}
        {zoomStyle(pointer)}
      </style>
      <Header />
      <Footer />
    </>
  )
}
