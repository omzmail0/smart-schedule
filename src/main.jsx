import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx' // ✅ استيراد

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary> {/* ✅ تغليف التطبيق */}
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
