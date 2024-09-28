import './Debug.css'
import { showBox, showNumber, showPoint } from './lib/show'
import { Touches } from './lib/touch'
import { PointerState } from './lib/xstate-pointer'
import { SearchState } from './lib/xstate-search'
import { UiState } from './lib/xstate-ui'

interface DebugProps {
  _container: null | HTMLDivElement
  _ui: UiState
  _pointer: PointerState
  _touches: Touches
  _search: SearchState
}

export const Debug = (props: Readonly<DebugProps>) => {
  const {
    _container: container,
    _ui: ui,
    _pointer: pointer,
    _touches: touches,
    _search: search,
  } = props
  const {
    context: { layout },
  } = pointer

  return (
    <div className="debug">
      <p>Debug</p>
      <ul>
        {[
          ['Ui', ui.value.Ui],
          ['Search', search.value],
          ['Pointer', pointer.value.Pointer],
          ['Slider.PointerHandler', pointer.value.Slider.PointerHandler],
          ['Slider.ScrollHandler', pointer.value.Slider.ScrollHandler],
          ['Expander', pointer.value.Expander],
          ['Animator', pointer.value.Animator],
          ['PointerMonitor', pointer.value.PointerMonitor],
          ['TouchMonitor', pointer.value.TouchMonitor],
          ['Mover', pointer.value.Mover],
          ['Zoomer', pointer.value.Zoomer],
          ['Dragger', pointer.value.Dragger],
          ['Panner', pointer.value.Panner],
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
        <li>layout.scroll: {showBox(layout.scroll)}</li>
        <li>layout.svgOffset: {showPoint(layout.svgOffset)}</li>
        <li>layout.svgScale: {showNumber(layout.svgScale.s)}</li>
        <li>layout.svg: {showBox(layout.svg)}</li>
        <li>touches.dists: {touches.dists.map(showNumber).join(' ')}</li>
        <li>touches.z: {touches.z === null ? '-' : showNumber(touches.z)}</li>
        {/*
        <li>layout.config.container: {showBox(layout.config.container)}</li>
        <li>layout.config.svg: {showBox(layout.config.svg)}</li>
        <li>layout.config.svgOffset: {showPoint(layout.config.svgOffset)}</li>
        <li>layout.config.svgScale: {showNumber(layout.config.svgScale.s)}</li>
        <li>layout.config.fontSize: {showNumber(layout.config.fontSize)}</li>
        */}
      </ul>
    </div>
  )
}
