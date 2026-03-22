import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import LandingPage from './pages/LandingPage/LandingPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import NetworkPage from './pages/NetworkPage/NetworkPage'
import NotificationsPage from './pages/NotificationsPage/NotificationsPage'

function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/profile/:address" element={<ProfilePage />} />
        <Route path="/network" element={<NetworkPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>
    </>
  )
}

export default App
