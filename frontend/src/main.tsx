import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import { LanguageProvider } from './context/LanguageContext'
import { AccessibilityProvider } from './context/AccessibilityContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <AccessibilityProvider>
        <App />
      </AccessibilityProvider>
    </LanguageProvider>
  </React.StrictMode>,
)

