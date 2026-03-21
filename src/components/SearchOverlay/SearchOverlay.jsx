import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import chevronLeftIcon from 'pixelarticons/svg/chevron-left.svg?raw'
import clockIcon from 'pixelarticons/svg/clock.svg?raw'
import searchIcon from 'pixelarticons/svg/search.svg?raw'
import { STORAGE_KEY } from '../Navbar/Navbar'
import styles from './SearchOverlay.module.scss'

const isMobile = () => window.matchMedia('(max-width: 1023px)').matches

function SearchOverlay({
  isOpen, onClose,
  searchQuery, setSearchQuery,
  anchorRef,
  recentSearches, setRecentSearches, saveSearch,
}) {
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 320 })
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  useLayoutEffect(() => {
    if (!isOpen || isMobile()) return
    if (!anchorRef?.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
  }, [isOpen, anchorRef])

  useEffect(() => {
    if (!isOpen || !isMobile()) return
    document.body.style.overflow = 'hidden'
    inputRef.current?.focus()
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen || isMobile()) return
    function handleMouseDown(e) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        anchorRef?.current && !anchorRef.current.contains(e.target)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen, onClose, anchorRef])

  if (!isOpen) return null

  function handleSubmit(e) {
    e.preventDefault()
    saveSearch(searchQuery)
  }

  function handleRecentClick(term) {
    setSearchQuery(term)
    inputRef.current?.focus()
  }

  function handleClear() {
    setRecentSearches([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const recentSection = recentSearches.length > 0 && (
    <>
      <div className={styles.recentHeader}>
        <span>Recent searches</span>
        <hr />
        <button type="button" className={styles.clearButton} onClick={handleClear}>
          Clear
        </button>
      </div>
      <ul className={styles.recentList}>
        {recentSearches.map(term => (
          <li key={term}>
            <button
              type="button"
              className={styles.recentItem}
              onClick={() => handleRecentClick(term)}
            >
              <span className={styles.recentIcon} dangerouslySetInnerHTML={{ __html: clockIcon }} />
              {term}
            </button>
          </li>
        ))}
      </ul>
    </>
  )

  if (!isMobile()) {
    if (!recentSearches.length) return null
    return (
      <div
        ref={dropdownRef}
        className={styles.dropdown}
        style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
      >
        {recentSection}
      </div>
    )
  }

  const content = (
    <>
      <form className={styles.topRow} onSubmit={handleSubmit}>
        <button
          type="button"
          className={styles.backButton}
          onClick={onClose}
          aria-label="Close search"
        >
          <span dangerouslySetInnerHTML={{ __html: chevronLeftIcon }} />
        </button>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon} dangerouslySetInnerHTML={{ __html: searchIcon }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search"
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      <div className={styles.divider} />

      {recentSection}
    </>
  )

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {content}
      </div>
    </div>
  )
}

export default SearchOverlay
