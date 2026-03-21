import { useState, useEffect, useCallback } from 'react'

function getProvider() {
  if (typeof window !== 'undefined' && window.phantom?.solana?.isPhantom) {
    return window.phantom.solana
  }
  return null
}

const DISCONNECTED_KEY = 'unlinked_disconnected'

export function usePhantom() {
  const [address, setAddress] = useState(null)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    const provider = getProvider()
    if (!provider) return
    if (localStorage.getItem(DISCONNECTED_KEY)) return

    provider.connect({ onlyIfTrusted: true })
      .then((resp) => setAddress(resp.publicKey.toBase58()))
      .catch(() => {})

    const handleDisconnect = () => setAddress(null)
    const handleAccountChanged = (publicKey) => {
      setAddress(publicKey ? publicKey.toBase58() : null)
    }

    provider.on('disconnect', handleDisconnect)
    provider.on('accountChanged', handleAccountChanged)

    return () => {
      provider.off('disconnect', handleDisconnect)
      provider.off('accountChanged', handleAccountChanged)
    }
  }, [])

  const connect = useCallback(async () => {
    const provider = getProvider()
    if (!provider) {
      window.open('https://phantom.app/', '_blank')
      return
    }
    setConnecting(true)
    try {
      const resp = await provider.connect()
      localStorage.removeItem(DISCONNECTED_KEY)
      setAddress(resp.publicKey.toBase58())
    } catch (err) {
      console.error('Phantom connect error:', err)
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    const provider = getProvider()
    if (provider) {
      await provider.disconnect()
    }
    localStorage.setItem(DISCONNECTED_KEY, '1')
    setAddress(null)
  }, [])

  return { address, connecting, connect, disconnect }
}
