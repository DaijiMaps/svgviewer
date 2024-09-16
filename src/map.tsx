import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Map1 from './Map1'
import './index.css'

// eslint-disable-next-line functional/no-expression-statements
createRoot(document.getElementById('map-root')!).render(
  <StrictMode>
    <Map1 />
  </StrictMode>
)
