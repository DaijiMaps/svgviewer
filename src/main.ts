import asas from './assets/asas.svg'
import { svgMapViewerConfig } from './lib/config'
import { RenderInfo } from './main-render'
import { workerSearchStart } from './main-search'
import { svgmapviewer } from './svgmapviewer'

svgmapviewer({
  root: 'root',
  map: 'map1',
  href: asas,
  width: 1928,
  height: 1363,
  zoomFactor: 2,
  renderInfo: RenderInfo,
})

svgMapViewerConfig.searchCbs.push(workerSearchStart)

document.title = `svgmapviewer @ ${window.location.host}`
