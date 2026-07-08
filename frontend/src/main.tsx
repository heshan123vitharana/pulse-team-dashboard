import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from '@/components/theme-provider'
import './index.css'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found in index.html')

createRoot(rootEl).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="pulse-theme">
      <App />
    </ThemeProvider>
  </StrictMode>,
)
