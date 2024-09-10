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
        <li>focus: {showPoint(pointer.context.focus)}</li>
        <li>expand: {showNumber(pointer.context.expand)}</li>
        <li>zoom: {showNumber(pointer.context.zoom)}</li>
        {container !== null && (
          <>
            <li>container.scrollLeft: {showNumber(container.scrollLeft)}</li>
            <li>container.scrollTop: {showNumber(container.scrollTop)}</li>
          </>
        )}
        <li>layout.config.body: {showBox(layout.config.body)}</li>
        <li>layout.config.svg: {showBox(layout.config.svg)}</li>
        <li>layout.config.svgOffset: {showPoint(layout.config.svgOffset)}</li>
        <li>layout.config.svgScale: {showNumber(layout.config.svgScale.s)}</li>
        <li>layout.config.fontSize: {showNumber(layout.config.fontSize)}</li>
        <li>
          layout.config.fontSizeSvg: {showNumber(layout.config.fontSizeSvg)}
        </li>
        <li>layout.container: {showBox(layout.container)}</li>
        <li>layout.svgOffset: {showPoint(layout.svgOffset)}</li>
        <li>layout.svgScale: {showNumber(layout.svgScale.s)}</li>
        <li>layout.svg: {showBox(layout.svg)}</li>
      </ul>
    </div>
  )
}
