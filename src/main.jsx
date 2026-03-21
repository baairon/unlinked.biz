import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { WalletProvider } from './contexts/WalletContext'
import './styles/global.scss'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <WalletProvider>
        <App />
      </WalletProvider>
    </BrowserRouter>
  </StrictMode>,
)
