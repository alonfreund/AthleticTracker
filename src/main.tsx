import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './styles/global.css'
import { applyTheme, readTheme } from './app/theme'

applyTheme(readTheme())
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
