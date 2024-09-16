import './App.css'
import { config } from './lib/config'
import { Viewer } from './Viewer'

function App() {
  return (
    <Viewer>
      <use width={config.WIDTH} height={config.HEIGHT} href="#Map1" />
    </Viewer>
  )
}

export default App
