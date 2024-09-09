import './App.css'
import asas from './assets/asas.svg'
import { config } from './lib/config'
import { Viewer } from './Viewer'

function App() {
  return (
    <Viewer>
      <image width={config.WIDTH} height={config.HEIGHT} href={asas} />
    </Viewer>
  )
}

export default App
