import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../../contexts/WalletContext'
import WalletDropdown from './WalletDropdown'
import searchIcon from 'pixelarticons/svg/search.svg?raw'
import homeIcon from 'pixelarticons/svg/home.svg?raw'
import usersIcon from 'pixelarticons/svg/users.svg?raw'
import briefcaseIcon from 'pixelarticons/svg/briefcase.svg?raw'
import bellIcon from 'pixelarticons/svg/bell.svg?raw'
import SearchOverlay from '../SearchOverlay/SearchOverlay'
import styles from './Navbar.module.scss'

export const STORAGE_KEY = 'unlinked_recent_searches'
const MAX_RECENT = 5

function loadRecent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function Navbar() {
  const { address, connecting, connect, disconnect } = useWallet()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState(loadRecent)
  const searchRef = useRef(null)

  function saveSearch(term) {
    term = term.trim()
    if (!term) return
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, MAX_RECENT)
    setRecentSearches(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  function handleDesktopSubmit(e) {
    e.preventDefault()
    saveSearch(searchQuery)
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.inner}>
          <div className={styles.left}>
            <Link to="/" className={styles.logo}>
              unlinked<span className={styles.tld}>.biz</span>
            </Link>
            <form className={styles.search} ref={searchRef} onSubmit={handleDesktopSubmit}>
              <button type="submit" className={styles.searchIcon} dangerouslySetInnerHTML={{ __html: searchIcon }} />
              <input
                type="text"
                placeholder="Search"
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
              />
            </form>
          </div>

          <div className={styles.right}>
            <div className={styles.links}>
              <Link to="/" className={styles.iconLink}>
                <span dangerouslySetInnerHTML={{ __html: homeIcon }} />
                Home
              </Link>
              <Link to="/network" className={styles.iconLink}>
                <span dangerouslySetInnerHTML={{ __html: usersIcon }} />
                My Network
              </Link>
              <Link to="#jobs" className={styles.iconLink}>
                <span dangerouslySetInnerHTML={{ __html: briefcaseIcon }} />
                Jobs
              </Link>
              <Link to="/notifications" className={styles.iconLink}>
                <span dangerouslySetInnerHTML={{ __html: bellIcon }} />
                Notifications
              </Link>
            </div>
            <button
              className={styles.searchToggle}
              onClick={() => setSearchOpen(o => !o)}
              aria-label="Toggle search"
            >
              <span dangerouslySetInnerHTML={{ __html: searchIcon }} />
            </button>
            {address ? (
              <WalletDropdown address={address} disconnect={disconnect} />
            ) : (
              <button
                type="button"
                className={styles.wallet}
                onClick={connect}
                disabled={connecting}
              >
                {connecting ? '...' : 'Connect'}
              </button>
            )}
          </div>
        </div>
      </nav>

      <nav className={styles.bottomNav} aria-label="Mobile navigation">
        <Link to="/" className={styles.bottomNavItem}>
          <span className={styles.bottomNavIcon} dangerouslySetInnerHTML={{ __html: homeIcon }} />
          <span className={styles.bottomNavLabel}>Home</span>
        </Link>
        <Link to="#network" className={styles.bottomNavItem}>
          <span className={styles.bottomNavIcon} dangerouslySetInnerHTML={{ __html: usersIcon }} />
          <span className={styles.bottomNavLabel}>Network</span>
        </Link>
        <Link to="#jobs" className={styles.bottomNavItem}>
          <span className={styles.bottomNavIcon} dangerouslySetInnerHTML={{ __html: briefcaseIcon }} />
          <span className={styles.bottomNavLabel}>Jobs</span>
        </Link>
        <Link to="/notifications" className={styles.bottomNavItem}>
          <span className={styles.bottomNavIcon} dangerouslySetInnerHTML={{ __html: bellIcon }} />
          <span className={styles.bottomNavLabel}>Notifications</span>
        </Link>
        <button
          className={styles.bottomNavItem}
          onClick={() => setSearchOpen(o => !o)}
          aria-label="Toggle search"
        >
          <span className={styles.bottomNavIcon} dangerouslySetInnerHTML={{ __html: searchIcon }} />
          <span className={styles.bottomNavLabel}>Search</span>
        </button>
      </nav>

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        anchorRef={searchRef}
        recentSearches={recentSearches}
        setRecentSearches={setRecentSearches}
        saveSearch={saveSearch}
      />
    </>
  )
}

export default Navbar
