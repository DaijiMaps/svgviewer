import asas from './assets/asas.svg'
import { svgviewer } from './svgviewer'

svgviewer({
  root: 'root',
  map: 'map1',
  href: asas,
  width: 1928,
  height: 1363,
  zoomFactor: 3,
})

document.title = `svgmapviewer @ ${window.location.host}`
