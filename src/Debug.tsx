import './Debug.css'
import { showBox, showNumber, showPoint } from './lib/show'
import { PointerState } from './lib/xstate-pointer'

interface DebugProps {
  _pointer: PointerState
  _container: null | HTMLDivElement
}

export const Debug = (props: DebugProps) => {
  const { _pointer: pointer, _container: container } = props
  const {
    context: { layout },
  } = pointer

  return (
    <div className="debug">
      <p>Debug</p>
      <ul>
        {[
          ['pointer', pointer.value.pointer],
          pointer.value.dragger !== 'inactive'
            ? ['dragger.active', pointer.value.dragger.active]
            : ['dragger', pointer.value.dragger],
          ['slider.handler', pointer.value.slider.handler],
          ['slider.drag', pointer.value.slider.drag],
          ['expander', pointer.value.expander],
          ['reflector', pointer.value.reflector],
          ['animator', pointer.value.animator],
          ['pointerMonitor', pointer.value.pointerMonitor],
          ['touchHandler', pointer.value.touchHandler],
          ['touchMonitor', pointer.value.touchMonitor],
        ].map(([k, v], i) => (
          <li key={i}>
            {k as string}: {typeof v === 'string' ? v : JSON.stringify(v)}
          </li>
        ))}
        {container !== null && (
          <>
            <li>container.scrollLeft: {showNumber(container.scrollLeft)}</li>
            <li>container.scrollTop: {showNumber(container.scrollTop)}</li>
          </>
        )}
        <li>layout.config.bodyViewBox: {showBox(layout.config.bodyViewBox)}</li>
        <li>layout.config.svgViewBox: {showBox(layout.config.svgViewBox)}</li>
        <li>layout.config.svgOffset: {showPoint(layout.config.svgOffset)}</li>
        <li>layout.config.svgScale: {showNumber(layout.config.svgScale.s)}</li>
        <li>layout.config.fontSize: {showNumber(layout.config.fontSize)}</li>
        <li>
          layout.config.fontSizeSvg: {showNumber(layout.config.fontSizeSvg)}
        </li>
        <li>layout.focus: {showPoint(layout.focus)}</li>
        <li>layout.expand: {showNumber(layout.expand)}</li>
        <li>layout.zoom: {showNumber(layout.zoom)}</li>
        <li>layout.containerViewBox: {showBox(layout.containerViewBox)}</li>
        <li>layout.svgOffset: {showPoint(layout.svgOffset)}</li>
        <li>layout.svgScale: {showNumber(layout.svgScale.s)}</li>
        <li>layout.svgViewBox: {showBox(layout.svgViewBox)}</li>
        <li>
          layout.drag.startContainerViewBox:{' '}
          {showBox(layout.startContainerViewBox)}
        </li>
      </ul>
    </div>
  )
}
