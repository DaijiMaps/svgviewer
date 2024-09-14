import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
document.title = `Daiji Maps SVG Viewer @ ${window.location.hostname}`

// eslint-disable-next-line functional/no-expression-statements
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
