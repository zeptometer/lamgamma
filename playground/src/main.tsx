import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, BaseStyles } from '@primer/react'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <BaseStyles>
      <StrictMode>
        <App />
      </StrictMode>,
    </BaseStyles>
  </ThemeProvider>
)
