import { Box } from './lib/box'

export interface DiagProps {
  width: number
  height: number
  stroke: string
  viewBox?: Box
}

export function Diag(props: DiagProps) {
  const { width, height, stroke, viewBox } = props
  return (
    <>
      {viewBox && (
        <>
          <path
            d={`M${viewBox.x},${viewBox.y}l${viewBox.width},0l0,${viewBox.height}l${-viewBox.width},0z`}
            fill="whitesmoke"
            stroke="none"
          />
          <path d={`M-1000,0h2000`} stroke="red" strokeWidth="0.25" />
          <path d={`M0,-1000v2000`} stroke="red" strokeWidth="0.25" />
          <circle
            cx="0"
            cy="0"
            r="5"
            fill="none"
            stroke="red"
            strokeWidth="0.5"
          />
        </>
      )}
      <path
        d={`M0,0l${width},0 0,${height} -${width},0z`}
        fill="none"
        stroke={stroke}
        strokeWidth="1"
      />
      <path
        d={`M0,0l${width},${height}M${width},0l-${width},${height}M${
          width / 2
        },0l0,${height}M0,${height / 2}l${width},0`}
        fill="none"
        stroke={stroke}
        strokeWidth="0.5"
      />
    </>
  )
}
