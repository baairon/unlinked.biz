import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import userIcon from 'pixelarticons/svg/user.svg?raw'
import copyIcon from 'pixelarticons/svg/copy.svg?raw'
import walletIcon from 'pixelarticons/svg/wallet.svg?raw'
import logoutIcon from 'pixelarticons/svg/logout.svg?raw'
import clockIcon from 'pixelarticons/svg/clock.svg?raw'
import styles from './WalletDropdown.module.scss'

function truncate(addr) {
  return addr.slice(0, 4) + '...' + addr.slice(-4)
}

function WalletDropdown({ address, disconnect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className={styles.wrapper} ref={ref}>
      <button className={styles.trigger} onClick={() => setOpen(o => !o)}>
        <span dangerouslySetInnerHTML={{ __html: walletIcon }} />
        {truncate(address)}
      </button>
      {open && (
        <div className={styles.dropdown}>
          <button className={styles.menuItem} onClick={() => {
            navigate(`/profile/${address}`)
            setOpen(false)
          }}>
            <span dangerouslySetInnerHTML={{ __html: userIcon }} />
            Profile
          </button>
          <button className={styles.menuItem} onClick={() => {
            navigate(`/profile/${address}#history`)
            setOpen(false)
          }}>
            <span dangerouslySetInnerHTML={{ __html: clockIcon }} />
            Version History
          </button>

          <button className={styles.menuItem} onClick={() => {
            disconnect()
            setOpen(false)
          }}>
            <span dangerouslySetInnerHTML={{ __html: logoutIcon }} />
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}

export default WalletDropdown
