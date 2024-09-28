import { PropsWithChildren } from 'react'
import { BoxBox as Box, boxToViewBox } from './lib/box/prefixed'
import './Svg.css'

interface SvgProps {
  _viewBox: Box
  onAnimationEnd?: React.AnimationEventHandler<SVGSVGElement>
}

export const Svg = (props: Readonly<PropsWithChildren<SvgProps>>) => {
  const { _viewBox: viewBox } = props
  const { onAnimationEnd } = props

  return (
    <svg
      className="content svg"
      viewBox={boxToViewBox(viewBox)}
      onAnimationEnd={onAnimationEnd}
    >
      {props.children}
    </svg>
  )
}
