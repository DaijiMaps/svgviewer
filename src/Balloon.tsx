import { useSelector } from '@xstate/react'
import { ReactNode } from 'react'
import './Balloon.css'
import { Dir } from './lib/dir'
import { OpenClose, openCloseIsVisible } from './lib/open-close'
import { selectLayout } from './lib/react-pointer'
import { selectBalloon, selectDetail } from './lib/react-ui'
import { Vec } from './lib/vec'
import { vecVec } from './lib/vec/prefixed'
import { PointerRef } from './lib/xstate-pointer'
import { UiRef } from './lib/xstate-ui'

export interface BalloonPathProps {
  fg: boolean
  d: number
  dir: Dir
  ll: number
  bw: number
  bh: number
}

function BalloonPath(props: Readonly<BalloonPathProps>) {
  const { fg, d, dir, ll, bw, bh } = props

  const hbw = bw / 2
  const hbh = bh / 2

  const lw = bw / 20
  const hlw = lw / 2

  // XXX refactor
  const path =
    dir === 0
      ? `
M${hbw + d},${-ll + d}
l${hlw},${ll}
l${hbw - hlw},0
l0,${bh}
l${-bw},0
l0,${-bh}
l${hbw - hlw},0
z
`
      : dir === 1
        ? `
M${bw + ll + d},${hbh + d}
l${-ll},${hlw}
l0,${hbh - hlw}
l${-bw},0
l0,${-bh}
l${bw},0
l0,${hbh - hlw}
z
`
        : dir === 2
          ? `
M${hbw + d},${bh + ll + d}
l${-hlw},${-ll}
l${-(hbw - hlw)},0
l0,${-bh}
l${bw},0
l0,${bh}
l${-(hbw - hlw)},0
z
`
          : `
M${-ll + d},${hbh + d}
l${ll},${-hlw}
l0,${-(hbh - hlw)}
l${bw},0
l0,${bh}
l${-bw},0
l0,${-(hbh - hlw)}
z
`

  return <path className={fg ? 'fg' : 'bg'} d={path} />
}

export interface BalloonProps {
  _uiRef: UiRef
  _pointerRef: PointerRef
}

export function Balloon(props: Readonly<BalloonProps>): ReactNode {
  const { _uiRef: uiRef } = props

  const balloon = useSelector(uiRef, selectBalloon)
  const detail = useSelector(uiRef, selectDetail)

  const layout = useSelector(props._pointerRef, selectLayout)
  //const focus = useSelector(props._pointerRef, selectFocus)

  // XXX
  const vmin = Math.min(layout.container.width, layout.container.height) * 0.01
  const container = { width: vmin * 40, height: vmin * 40 }
  const ll = vmin * 10

  const bw = container.width
  const bh = container.height

  const d = bw / 100

  const p = { ll, bw, bh }

  return !openCloseIsVisible(balloon) ? (
    <></>
  ) : (
    <svg
      className="balloon"
      viewBox={`${-ll} ${-ll} ${bw + ll * 2 + d} ${bh + ll * 2 + d}`}
      // eslint-disable-next-line functional/no-return-void
      onAnimationEnd={() => uiRef.send({ type: 'BALLOON.ANIMATION.END' })}
    >
      {detail === null ? (
        <></>
      ) : (
        <>
          <BalloonPath fg={false} d={d} dir={detail.dir} {...p} />
          <BalloonPath fg={true} d={0} dir={detail.dir} {...p} />
        </>
      )}
    </svg>
  )
}

export function BalloonStyle(
  props: Readonly<Pick<BalloonProps, '_uiRef'>>
): ReactNode {
  const { _uiRef: uiRef } = props

  const balloon = useSelector(uiRef, selectBalloon)
  const detail = useSelector(uiRef, selectDetail)

  if (!openCloseIsVisible(balloon) || detail === null) {
    return <></>
  } else {
    return <style>{balloonStyle(balloon, detail.p, detail.dir)}</style>
  }
}

const ds: Vec[] = [
  vecVec(20, 0 - 10), // 0 - top
  vecVec(40 + 10, 20), // 1 - right
  vecVec(20, 40 + 10), // 2 - bottom
  vecVec(0 - 10, 20), // 3 - left
]

function balloonStyle(
  { open, animating }: OpenClose,
  o: null | Vec,
  dir: null | Dir
) {
  if (o === null || dir === null) {
    return ``
  }

  const d = ds[dir]

  if (!animating) {
    return `
.detail{
  transform-origin: ${d.x}vmin ${d.y}vmin;
  transform: translate(${o.x}px, ${o.y}px) translate(${-d.x}vmin, ${-d.y}vmin) scale(1);
}

.balloon {
  transform-origin: ${d.x + 10}vmin ${d.y + 10}vmin;
  transform: translate(${o.x}px, ${o.y}px) translate(${-d.x - 10}vmin, ${-d.y - 10}vmin) scale(1);
}
`
  } else {
    const opacityA = open ? 0 : 1
    const opacityB = open ? 1 : 0
    const scaleA = open ? 0 : 1
    const scaleB = open ? 1 : 0

    return `
.detail,
.balloon {
  transition: transform 300ms;
}

.detail{
  transform-origin: ${d.x}vmin ${d.y}vmin;
  animation: xxx-detail 300ms ease;
  will-change: opacity transform;
}

.balloon {
  transform-origin: ${d.x + 10}vmin ${d.y + 10}vmin;
  animation: xxx-balloon 300ms ease;
  will-change: opacity transform;
}

@keyframes xxx-detail {
  from {
    opacity: ${opacityA};
    transform: translate(${o.x}px, ${o.y}px) translate(${-d.x}vmin, ${-d.y}vmin) scale(${scaleA});
  }
  to {
    opacity: ${opacityB};
    transform: translate(${o.x}px, ${o.y}px) translate(${-d.x}vmin, ${-d.y}vmin) scale(${scaleB});
  }
}

@keyframes xxx-balloon {
  from {
    opacity: ${opacityA};
    transform: translate(${o.x}px, ${o.y}px) translate(${-d.x - 10}vmin, ${-d.y - 10}vmin) scale(${scaleA});
  }
  to {
    opacity: ${opacityB};
    transform: translate(${o.x}px, ${o.y}px) translate(${-d.x - 10}vmin, ${-d.y - 10}vmin) scale(${scaleB});
  }
}
`
  }
}
