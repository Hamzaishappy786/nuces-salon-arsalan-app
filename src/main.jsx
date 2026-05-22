import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* HashRouter is REQUIRED for Capacitor — the Android webview does not
        support the HTML5 history API that BrowserRouter depends on. */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
)
