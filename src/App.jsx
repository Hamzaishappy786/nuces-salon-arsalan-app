import { Routes, Route, Navigate } from 'react-router-dom'
import Splash   from './pages/Splash.jsx'
import Today    from './pages/Today.jsx'
import Upcoming from './pages/Upcoming.jsx'
import Earnings from './pages/Earnings.jsx'

export default function App() {
  return (
    <Routes>
      {/* Splash — auto-navigates to /today after 1 second */}
      <Route path="/"        element={<Splash />} />

      {/* Main pages */}
      <Route path="/today"    element={<Today />} />
      <Route path="/upcoming" element={<Upcoming />} />
      <Route path="/earnings" element={<Earnings />} />

      {/* Catch-all → splash */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
