import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./fonts/opun-mai/OpunMaiRegular.ttf"
import "./fonts/opun-mai/OpunMaiLight.ttf"
import "./fonts/opun-mai/OpunMaiBold.ttf"
import './index.css'
import App from './App.tsx'
import { StyledEngineProvider } from '@mui/material'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <App />
    </StyledEngineProvider>
  </StrictMode>,
)
