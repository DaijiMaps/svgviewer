/* eslint-disable functional/no-return-void */
import { createContext, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { Box } from './lib/box/main'
import {
  SvgViewerConfig,
  svgViewerConfig,
  SvgViewerConfigUser,
  updateSvgViewerConfig,
} from './lib/config'

export type { SvgViewerConfig, SvgViewerConfigUser }

export const SvgViewerConfigContext =
  createContext<SvgViewerConfig>(svgViewerConfig)

export function svgviewer(configUser: Readonly<SvgViewerConfigUser>) {
  const origViewBox: Box = {
    x: 0,
    y: 0,
    width: typeof configUser.width === 'number' ? configUser.width : 0,
    height: typeof configUser.height === 'number' ? configUser.height : 0,
  }
  // eslint-disable-next-line functional/no-expression-statements
  updateSvgViewerConfig({
    origViewBox,
    ...configUser,
  })
  const config: SvgViewerConfig = {
    ...svgViewerConfig,
    origViewBox,
    ...configUser,
  }

  // eslint-disable-next-line functional/no-expression-statements
  createRoot(document.getElementById(config.root)!).render(
    <StrictMode>
      <SvgViewerConfigContext.Provider value={config}>
        <App />
      </SvgViewerConfigContext.Provider>
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
