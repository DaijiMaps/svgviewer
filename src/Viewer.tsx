import { PropsWithChildren, useRef } from 'react'
import { Container } from './Container'
import { Debug } from './Debug'
import { Footer } from './Footer'
import { Guides } from './Guides'
import { Inner } from './Inner'
import { usePointer } from './lib/react-pointer'
import { dragStyle, moveStyle, zoomStyle } from './lib/style'
import { Svg } from './Svg'

export const Viewer = (props: PropsWithChildren) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const { pointer, pointerSend, layout } = usePointer(containerRef)

  return (
    <>
      <Container
        ref={containerRef}
        _pointer={pointer}
        _pointerSend={pointerSend}
      >
        <Svg
          width={layout.containerViewBox.width}
          height={layout.containerViewBox.height}
          onAnimationEnd={() => pointerSend({ type: 'ANIMATION.END' })}
          _viewBox={layout.svgViewBox}
        >
          <Inner>{props.children}</Inner>
        </Svg>
      </Container>
      <Guides _layout={layout} />
      {pointer.context.debug && (
        <Debug _pointer={pointer} _container={containerRef.current} />
      )}
      <style>
        {dragStyle(pointer)}
        {moveStyle(pointer)}
        {zoomStyle(pointer)}
      </style>
      <Footer />
    </>
  )
}
