import { PropsWithChildren } from 'react'
import { BoxBox as Box, boxToViewBox } from './lib/box/prefixed'
import './Svg.css'

interface SvgProps {
  _viewBox: Box
  width: number
  height: number
  onAnimationEnd?: React.AnimationEventHandler<SVGSVGElement>
}

export const Svg = (props: Readonly<PropsWithChildren<SvgProps>>) => {
  const { _viewBox: viewBox } = props
  const { onAnimationEnd, width, height } = props

  return (
    <svg
      className="svg"
      viewBox={boxToViewBox(viewBox)}
      style={{
        width,
        height,
      }}
      onAnimationEnd={onAnimationEnd}
    >
      {props.children}
    </svg>
  )
}
