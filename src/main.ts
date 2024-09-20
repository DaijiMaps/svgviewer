import tama from './assets/tama.svg'
import { svgviewer } from './svgviewer'

svgviewer({
  root: 'root',
  map: 'map1',
  href: tama,
  width: 2341.04,
  height: 1683.4,
  zoomFactor: 3,
})

document.title = `svgmapviewer @ ${window.location.host}`
