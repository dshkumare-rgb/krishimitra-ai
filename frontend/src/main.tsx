import React from 'react'
import ReactDOM from 'react-dom/client'
import './i18n'
import App from './App.tsx'
import './index.css'
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

