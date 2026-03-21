import { createContext, useContext } from 'react'
import { usePhantom } from '../hooks/usePhantom'

const WalletContext = createContext(null)

export function WalletProvider({ children }) {
  const wallet = usePhantom()
  return (
    <WalletContext.Provider value={wallet}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}
