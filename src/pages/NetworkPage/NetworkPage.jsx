import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../../contexts/WalletContext'
import { getMyConnections } from '../../services/connections'
import { fetchProfileFromChain } from '../../services/solana'
import { gatewayUrl } from '../../services/ipfs'
import usersIcon from 'pixelarticons/svg/users.svg?raw'
import userIcon from 'pixelarticons/svg/user.svg?raw'
import styles from './NetworkPage.module.scss'

function truncate(addr) {
  if (!addr) return ''
  const s = typeof addr === 'string' ? addr : addr.toBase58()
  return s.slice(0, 4) + '...' + s.slice(-4)
}

function NetworkPage() {
  const wallet = useWallet()
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState({})

  useEffect(() => {
    if (!wallet.address) {
      setLoading(false)
      return
    }

    async function load() {
      setLoading(true)
      try {
        const conns = await getMyConnections(wallet.address)
        setConnections(conns)

        
        const profileMap = {}
        await Promise.all(
          conns.map(async (conn) => {
            const addr = conn.otherWallet.toBase58()
            try {
              const onChain = await fetchProfileFromChain(addr)
              if (onChain?.cid) {
                const res = await fetch(gatewayUrl(onChain.cid))
                if (res.ok) profileMap[addr] = await res.json()
              }
            } catch {}
          })
        )
        setProfiles(profileMap)
      } catch (err) {
        console.error('[network] load error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [wallet.address])

  if (!wallet.address) {
    return (
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.header}>
            <span className={styles.headerIcon} dangerouslySetInnerHTML={{ __html: usersIcon }} />
            <h1 className={styles.title}>My Network</h1>
          </div>
          <p className={styles.empty}>Connect your wallet to see your network.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.headerIcon} dangerouslySetInnerHTML={{ __html: usersIcon }} />
          <h1 className={styles.title}>My Network</h1>
          <span className={styles.count}>{connections.length}</span>
        </div>

        {loading && <p className={styles.empty}>Loading...</p>}

        {!loading && connections.length === 0 && (
          <p className={styles.empty}>No connections yet. Visit someone's profile to connect.</p>
        )}

        {!loading && connections.map((conn) => {
          const addr = conn.otherWallet.toBase58()
          const profile = profiles[addr]
          const name = profile
            ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
            : null

          return (
            <Link to={`/profile/${addr}`} key={addr} className={styles.card}>
              <div className={styles.cardAvatar}>
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="" className={styles.cardAvatarImg} />
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: userIcon }} />
                )}
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.cardName}>{name || truncate(addr)}</span>
                {name && <span className={styles.cardAddr}>{truncate(addr)}</span>}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default NetworkPage
