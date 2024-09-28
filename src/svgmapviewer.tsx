/* eslint-disable functional/no-return-void */
import { createContext, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { Box } from './lib/box/main'
import {
  SvgMapViewerConfig,
  svgMapViewerConfig,
  SvgMapViewerConfigUser,
  updateSvgMapViewerConfig,
} from './lib/config'
import { searchSearchDone, searchSearchStart } from './lib/search'

export type { SvgMapViewerConfig, SvgMapViewerConfigUser }

export const SvgMapViewerConfigContext = createContext(svgMapViewerConfig)

export function svgmapviewer(configUser: Readonly<SvgMapViewerConfigUser>) {
  const origViewBox: Box = {
    x: 0,
    y: 0,
    width: typeof configUser.width === 'number' ? configUser.width : 0,
    height: typeof configUser.height === 'number' ? configUser.height : 0,
  }
  // eslint-disable-next-line functional/no-expression-statements
  updateSvgMapViewerConfig({
    origViewBox,
    ...configUser,
  })
  const config: SvgMapViewerConfig = {
    ...svgMapViewerConfig,
    origViewBox,
    ...configUser,
  }

  // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
  svgMapViewerConfig.searchStartCbs.push(searchSearchStart)
  // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
  svgMapViewerConfig.searchDoneCbs.push(searchSearchDone)

  // eslint-disable-next-line functional/no-expression-statements
  createRoot(document.getElementById(config.root)!).render(
    <StrictMode>
      <SvgMapViewerConfigContext.Provider value={config}>
        <App />
      </SvgMapViewerConfigContext.Provider>
      <svg>
        <defs>
          <image
            id={config.map}
            href={config.href}
            width={config.width}
            height={config.height}
          />
        </defs>
      </svg>
    </StrictMode>
  )
}
