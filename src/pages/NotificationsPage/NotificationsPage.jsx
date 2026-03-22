import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../../contexts/WalletContext'
import { getPendingRequestsForMe, acceptConnectionRequest, rejectConnectionRequest } from '../../services/connections'
import bellIcon from 'pixelarticons/svg/bell.svg?raw'
import userIcon from 'pixelarticons/svg/user.svg?raw'
import styles from './NotificationsPage.module.scss'

function truncate(addr) {
  if (!addr) return ''
  const s = typeof addr === 'string' ? addr : addr.toBase58()
  return s.slice(0, 4) + '...' + s.slice(-4)
}

function NotificationsPage() {
  const wallet = useWallet()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)

  useEffect(() => {
    if (!wallet.address) {
      setLoading(false)
      return
    }

    async function load() {
      setLoading(true)
      try {
        const pending = await getPendingRequestsForMe(wallet.address)
        setRequests(pending)
      } catch (err) {
        console.error('[notifications] load error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [wallet.address])

  async function handleAccept(fromAddr) {
    setActing(fromAddr)
    try {
      await acceptConnectionRequest(fromAddr)
      setRequests(r => r.filter(req => req.from.toBase58() !== fromAddr))
    } catch (err) {
      console.error('[notifications] accept error:', err)
      alert('Accept failed: ' + err.message)
    } finally {
      setActing(null)
    }
  }

  async function handleReject(fromAddr) {
    setActing(fromAddr)
    try {
      await rejectConnectionRequest(fromAddr)
      setRequests(r => r.filter(req => req.from.toBase58() !== fromAddr))
    } catch (err) {
      console.error('[notifications] reject error:', err)
      alert('Reject failed: ' + err.message)
    } finally {
      setActing(null)
    }
  }

  if (!wallet.address) {
    return (
      <div className={styles.page}>
        <div className={styles.content}>
          <div className={styles.header}>
            <span className={styles.headerIcon} dangerouslySetInnerHTML={{ __html: bellIcon }} />
            <h1 className={styles.title}>Notifications</h1>
          </div>
          <p className={styles.empty}>Connect your wallet to see notifications.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.headerIcon} dangerouslySetInnerHTML={{ __html: bellIcon }} />
          <h1 className={styles.title}>Notifications</h1>
          {requests.length > 0 && <span className={styles.count}>{requests.length}</span>}
        </div>

        {loading && <p className={styles.empty}>Loading...</p>}

        {!loading && requests.length === 0 && (
          <p className={styles.empty}>No pending requests.</p>
        )}

        {!loading && requests.map((req) => {
          const fromAddr = req.from.toBase58()
          const isActing = acting === fromAddr

          return (
            <div key={fromAddr} className={styles.notification}>
              <div className={styles.notifAvatar}>
                <span dangerouslySetInnerHTML={{ __html: userIcon }} />
              </div>
              <div className={styles.notifInfo}>
                <span className={styles.notifText}>
                  Connection request from{' '}
                  <Link to={`/profile/${fromAddr}`} className={styles.notifLink}>
                    {truncate(fromAddr)}
                  </Link>
                </span>
              </div>
              <div className={styles.notifActions}>
                <button
                  className={styles.acceptBtn}
                  onClick={() => handleAccept(fromAddr)}
                  disabled={isActing}
                >
                  {isActing ? '...' : 'Accept'}
                </button>
                <button
                  className={styles.rejectBtn}
                  onClick={() => handleReject(fromAddr)}
                  disabled={isActing}
                >
                  Reject
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default NotificationsPage
