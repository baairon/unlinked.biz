import { useParams } from 'react-router-dom'
import { useEffect, useLayoutEffect } from 'react'
import { useWallet } from '../../contexts/WalletContext'
import { useProfileForm, formatUTCTimestamp } from '../../hooks/useProfileForm'
import userIcon from 'pixelarticons/svg/user.svg?raw'
import mapPinIcon from 'pixelarticons/svg/map-pin.svg?raw'
import linkIcon from 'pixelarticons/svg/link.svg?raw'
import briefcaseIcon from 'pixelarticons/svg/briefcase.svg?raw'
import calendarIcon from 'pixelarticons/svg/calendar.svg?raw'
import articleIcon from 'pixelarticons/svg/article.svg?raw'
import copyIcon from 'pixelarticons/svg/copy.svg?raw'
import walletIcon from 'pixelarticons/svg/wallet.svg?raw'
import zapIcon from 'pixelarticons/svg/zap.svg?raw'
import penSquareIcon from 'pixelarticons/svg/pen-square.svg?raw'
const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M20 22H4v-2h16v2ZM4 20H2V4h2v16Zm18 0h-2V4h2v16Zm-9-9h4v2h-4v4h-2v-4H7v-2h4V7h2v4Zm7-7H4V2h16v2Z"/></svg>`
const minusIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M4 11h16v2H4z"/></svg>`
import deleteIcon from 'pixelarticons/svg/delete.svg?raw'
import clockIcon from 'pixelarticons/svg/clock.svg?raw'
import undoIcon from 'pixelarticons/svg/undo.svg?raw'
import styles from './ProfilePage.module.scss'

function truncate(addr) {
  return addr.slice(0, 4) + '...' + addr.slice(-4)
}

function autoWidth(value, placeholder, min) {
  return `${Math.max(min, (value || placeholder).length) + 1}ch`
}

function ProfilePage() {
  const { address } = useParams()
  const wallet = useWallet()
  const isOwner = wallet.address && wallet.address === address
  const profile = useProfileForm()

  useEffect(() => {
    if (window.location.hash === '#history') {
      const el = document.getElementById('history')
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }, [address, window.location.hash])

  function handleSave() {
    profile.saveProfile()
  }

  return (
    <div className={styles.page}>
      <div className={styles.banner} />

      <div className={styles.content}>
        <div className={styles.header}>
          <div
            className={`${styles.avatar} ${isOwner ? styles.avatarEditable : ''}`}
            onClick={isOwner ? () => profile.avatarInputRef.current.click() : undefined}
          >
            {profile.avatarSrc
              ? <img src={profile.avatarSrc} alt="Profile" className={styles.avatarImg} />
              : <span dangerouslySetInnerHTML={{ __html: userIcon }} />
            }
            {isOwner && (
              <div className={styles.avatarEditOverlay}>
                <span dangerouslySetInnerHTML={{ __html: penSquareIcon }} />
                {profile.avatarSrc && (
                  <button
                    className={styles.avatarRemoveBtn}
                    onClick={e => { e.stopPropagation(); profile.setAvatarSrc(null); profile.avatarInputRef.current.value = '' }}
                    dangerouslySetInnerHTML={{ __html: deleteIcon }}
                  />
                )}
              </div>
            )}
            {isOwner && (
              <input
                ref={profile.avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={profile.handleAvatarChange}
              />
            )}
          </div>
          <div className={styles.identity}>
            <div className={styles.identityTop}>
              {isOwner ? (
                <div className={styles.nameFields}>
                  <input
                    className={styles.editable}
                    style={{ width: autoWidth(profile.firstName, 'First name', 10) }}
                    value={profile.firstName}
                    onChange={e => profile.setFirstName(e.target.value)}
                    placeholder="First name"
                    maxLength={25}
                  />
                  <input
                    className={styles.editable}
                    style={{ width: autoWidth(profile.lastName, 'Last name', 9) }}
                    value={profile.lastName}
                    onChange={e => profile.setLastName(e.target.value)}
                    placeholder="Last name"
                    maxLength={35}
                  />
                </div>
              ) : (
                <h1 className={styles.name}>
                  {profile.firstName || profile.lastName ? `${profile.firstName} ${profile.lastName}`.trim() : 'Anonymous'}
                </h1>
              )}
            </div>

            <div className={styles.metaRow}>
              <div className={styles.meta}>
                <span className={styles.metaIcon} dangerouslySetInnerHTML={{ __html: mapPinIcon }} />
                {isOwner ? (
                  <input
                    className={`${styles.editable} ${styles.editableSmall}`}
                    style={{ width: autoWidth(profile.location, 'Location', 8), maxWidth: '24ch' }}
                    value={profile.location}
                    onChange={e => profile.setLocation(e.target.value)}
                    placeholder="Location"
                    maxLength={50}
                  />
                ) : (
                  profile.location ? <span className={styles.metaText}>{profile.location}</span> : null
                )}
              </div>

              <div className={styles.meta}>
                <span className={styles.metaIcon} dangerouslySetInnerHTML={{ __html: linkIcon }} />
                {isOwner ? (
                  <input
                    className={`${styles.editable} ${styles.editableSmall}`}
                    style={{ width: autoWidth(profile.website, 'Website', 7), maxWidth: '30ch' }}
                    value={profile.website}
                    onChange={e => profile.setWebsite(e.target.value)}
                    placeholder="Website"
                    maxLength={60}
                  />
                ) : (
                  profile.website ? <span className={styles.metaText}>{profile.website}</span> : null
                )}
              </div>

              <div className={styles.meta}>
                <span className={styles.metaIcon} dangerouslySetInnerHTML={{ __html: walletIcon }} />
                <span className={styles.metaText}>{truncate(address)}</span>
                <button className={styles.copyBtn} onClick={() => navigator.clipboard.writeText(address)}>
                  <span dangerouslySetInnerHTML={{ __html: copyIcon }} />
                </button>
              </div>
            </div>

            {(profile.skills.length > 0 || isOwner) && (
              <div className={styles.skillsInline}>
                <span className={styles.meta}>
                  <span className={styles.metaIcon} dangerouslySetInnerHTML={{ __html: zapIcon }} />
                  <span className={styles.metaText}>Skills</span>
                </span>
                {profile.skills.length > 0 && (
                  <span className={styles.skillsList}>
                    {profile.skills.map(skill => (
                      <span key={skill} className={styles.skillItem}>
                        {skill}
                        {isOwner && (
                          <button className={styles.skillRemove} onClick={() => profile.removeSkill(skill)}>
                            <span dangerouslySetInnerHTML={{ __html: minusIcon }} />
                          </button>
                        )}
                      </span>
                    ))}
                  </span>
                )}
                {isOwner && profile.skills.length < 8 && (
                  <form className={styles.addSkill} onSubmit={profile.addSkill}>
                    <input
                      className={`${styles.editable} ${styles.editableSmall}`}
                      style={{ width: autoWidth(profile.skillInput, 'e.g. React, Solana', 18), maxWidth: '28ch' }}
                      value={profile.skillInput}
                      onChange={e => profile.setSkillInput(e.target.value)}
                      placeholder="e.g. React, Solana"
                      maxLength={100}
                    />
                  </form>
                )}
              </div>
            )}

          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon} dangerouslySetInnerHTML={{ __html: articleIcon }} />
              About
            </h2>
          </div>
          {isOwner ? (
            <div className={styles.aboutEdit}>
              <textarea
                className={`${styles.editable} ${styles.editableAbout}`}
                value={profile.about}
                onChange={e => profile.setAbout(e.target.value)}
                placeholder="Your background, what you work on, and what you're looking for."
                maxLength={500}
                rows={4}
              />
              <span className={styles.charCount}>{profile.about.length}/500</span>
            </div>
          ) : (
            profile.about
              ? <p className={styles.aboutText}>{profile.about}</p>
              : <span className={styles.empty}>No about added yet</span>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon} dangerouslySetInnerHTML={{ __html: briefcaseIcon }} />
              Experience
            </h2>
            {isOwner && (
              <button className={styles.addBtn} onClick={profile.addExperience}>
                <span dangerouslySetInnerHTML={{ __html: plusIcon }} />
              </button>
            )}
          </div>
          {profile.experience.length === 0 && (
            <span className={styles.empty}>No experience added yet</span>
          )}
          {profile.experience.map(exp => (
            <div key={exp.id} className={styles.entry}>
              {isOwner ? (
                <>
                  <input
                    className={`${styles.editable} ${styles.editableEntry}`}
                    value={exp.title}
                    onChange={e => profile.updateExperience(exp.id, 'title', e.target.value)}
                    placeholder="Title"
                    maxLength={50}
                  />
                  <input
                    className={`${styles.editable} ${styles.editableEntry}`}
                    value={exp.company}
                    onChange={e => profile.updateExperience(exp.id, 'company', e.target.value)}
                    placeholder="Company"
                    maxLength={50}
                  />
                  <div className={styles.entryDates}>
                    <input
                      className={`${styles.editable} ${styles.editableEntry}`}
                      value={exp.startDate}
                      onChange={e => profile.updateExperience(exp.id, 'startDate', e.target.value)}
                      placeholder="Start"
                      maxLength={15}
                    />
                    <input
                      className={`${styles.editable} ${styles.editableEntry}`}
                      value={exp.endDate}
                      onChange={e => profile.updateExperience(exp.id, 'endDate', e.target.value)}
                      placeholder="End"
                      maxLength={15}
                    />
                  </div>
                  <button className={styles.removeEntry} onClick={() => profile.removeExperience(exp.id)}>
                    <span dangerouslySetInnerHTML={{ __html: minusIcon }} />
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.entryTitle}>{exp.title || 'Untitled'}</div>
                  <div className={styles.entryCompany}>{exp.company}</div>
                  <div className={styles.entryDate}>{exp.startDate} — {exp.endDate}</div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon} dangerouslySetInnerHTML={{ __html: calendarIcon }} />
              Education
            </h2>
            {isOwner && (
              <button className={styles.addBtn} onClick={profile.addEducation}>
                <span dangerouslySetInnerHTML={{ __html: plusIcon }} />
              </button>
            )}
          </div>
          {profile.education.length === 0 && (
            <span className={styles.empty}>No education added yet</span>
          )}
          {profile.education.map(edu => (
            <div key={edu.id} className={styles.entry}>
              {isOwner ? (
                <>
                  <input
                    className={`${styles.editable} ${styles.editableEntry}`}
                    value={edu.school}
                    onChange={e => profile.updateEducation(edu.id, 'school', e.target.value)}
                    placeholder="School"
                    maxLength={60}
                  />
                  <input
                    className={`${styles.editable} ${styles.editableEntry}`}
                    value={edu.degree}
                    onChange={e => profile.updateEducation(edu.id, 'degree', e.target.value)}
                    placeholder="Degree"
                    maxLength={60}
                  />
                  <div className={styles.entryDates}>
                    <input
                      className={`${styles.editable} ${styles.editableEntry}`}
                      value={edu.startDate}
                      onChange={e => profile.updateEducation(edu.id, 'startDate', e.target.value)}
                      placeholder="Start"
                      maxLength={15}
                    />
                    <input
                      className={`${styles.editable} ${styles.editableEntry}`}
                      value={edu.endDate}
                      onChange={e => profile.updateEducation(edu.id, 'endDate', e.target.value)}
                      placeholder="End"
                      maxLength={15}
                    />
                  </div>
                  <button className={styles.removeEntry} onClick={() => profile.removeEducation(edu.id)}>
                    <span dangerouslySetInnerHTML={{ __html: minusIcon }} />
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.entryTitle}>{edu.school || 'Untitled'}</div>
                  <div className={styles.entryCompany}>{edu.degree}</div>
                  <div className={styles.entryDate}>{edu.startDate} — {edu.endDate}</div>
                </>
              )}
            </div>
          ))}
        </div>

        {(profile.history.length > 0 || isOwner) && (
          <div className={styles.section} id="history">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon} dangerouslySetInnerHTML={{ __html: clockIcon }} />
                Version History
              </h2>
              {isOwner && profile.history.length > 0 && (
                <button className={styles.clearAllBtn} onClick={profile.clearHistory}>
                  Clear all
                </button>
              )}
            </div>
            <p className={styles.activityNote}>
              Every update is a verifiable version on-chain. You have full sovereignty to redact or delete any state from your history at any time.
            </p>
            {profile.history.length === 0 && (
              <span className={styles.empty}>No activity yet — save your profile to create your first entry</span>
            )}
            {profile.history.map(entry => (
              <div key={entry.id} className={styles.historyEntry}>
                <span className={styles.historyHash}>{entry.id}</span>
                <span className={styles.historyDot}>·</span>
                <span className={styles.historyTime}>{formatUTCTimestamp(entry.timestamp)}</span>
                <span className={styles.historyDot}>·</span>
                <span className={styles.historyMessage}>{entry.message}</span>
                {isOwner && (
                  <div className={styles.historyActions}>
                    <button
                      className={styles.rollbackEntryBtn}
                      onClick={() => profile.rollback(entry)}
                      title="Rollback to this version"
                      dangerouslySetInnerHTML={{ __html: undoIcon }}
                    />
                    <button
                      className={styles.deleteEntryBtn}
                      onClick={() => profile.deleteHistoryEntry(entry.id)}
                      title="Delete this version"
                      dangerouslySetInnerHTML={{ __html: deleteIcon }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {isOwner && (
        <button className={styles.saveTab} onClick={handleSave}>Save</button>
      )}
    </div>
  )
}

export default ProfilePage
