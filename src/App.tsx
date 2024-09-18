import { useContext } from 'react'
import './App.css'
import { SvgViewerConfigContext } from './svgviewer'
import { Viewer } from './Viewer'

function App() {
  const config = useContext(SvgViewerConfigContext)

  return (
    <Viewer>
      <use
        href={`#${config.map}`}
        width={config.width}
        height={config.height}
      />
    </Viewer>
  )
}

export default App
