import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './context/ToastContext'
import { ToastContainer } from './components/ui/ToastContainer'
import { AuthProvider } from './context/AuthContext'
import { AccessibilityProvider } from './context/AccessibilityContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <AccessibilityProvider>
          <ToastProvider>
            <App />
            <ToastContainer />
          </ToastProvider>
        </AccessibilityProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
