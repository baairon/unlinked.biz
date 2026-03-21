import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import LandingPage from './pages/LandingPage/LandingPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'

function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/profile/:address" element={<ProfilePage />} />
      </Routes>
    </>
  )
}

export default App
