import { useState, useRef, useCallback, useEffect } from 'react'
import { uploadImage, uploadFile, gatewayUrl, unpinCid } from '../services/ipfs'
import { saveProfileOnChain, fetchProfileFromChain } from '../services/solana'
import { encryptProfile, decryptProfile, parseOnChainValue, buildOnChainValue } from '../services/crypto'

function generateShortHash() {
  return Math.random().toString(16).slice(2, 9)
}

function formatUTCTimestamp(timestamp) {
  const d = new Date(timestamp)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
}

function generateCommitMessage(prev, curr) {
  const parts = []

  if (prev.firstName !== curr.firstName || prev.lastName !== curr.lastName) {
    parts.push('Updated name')
  }
  if (prev.about !== curr.about) {
    parts.push('Updated about')
  }
  if (prev.location !== curr.location) {
    parts.push('Updated location')
  }
  if (prev.website !== curr.website) {
    parts.push('Updated website')
  }
  if (prev.avatar !== curr.avatar) {
    parts.push(curr.avatar ? 'Updated avatar' : 'Removed avatar')
  }

  const newSkills = curr.skills.filter(s => !prev.skills.includes(s))
  const removedSkills = prev.skills.filter(s => !curr.skills.includes(s))
  if (newSkills.length > 0) {
    parts.push(`Added ${newSkills.length} skill${newSkills.length > 1 ? 's' : ''}`)
  }
  if (removedSkills.length > 0) {
    parts.push(`Removed ${removedSkills.length} skill${removedSkills.length > 1 ? 's' : ''}`)
  }

  if (curr.experience.length > prev.experience.length) {
    const diff = curr.experience.length - prev.experience.length
    parts.push(`Added ${diff} experience${diff > 1 ? 's' : ''}`)
  } else if (curr.experience.length < prev.experience.length) {
    parts.push('Removed experience')
  } else if (JSON.stringify(prev.experience) !== JSON.stringify(curr.experience)) {
    parts.push('Updated experience')
  }

  if (curr.education.length > prev.education.length) {
    const diff = curr.education.length - prev.education.length
    parts.push(`Added ${diff} education${diff > 1 ? ' entries' : ''}`)
  } else if (curr.education.length < prev.education.length) {
    parts.push('Removed education')
  } else if (JSON.stringify(prev.education) !== JSON.stringify(curr.education)) {
    parts.push('Updated education')
  }

  if (parts.length === 0) return null
  return parts.join(', ')
}

export { formatUTCTimestamp }

export function useProfileForm(address) {
  const nextId = useRef(0)
  const avatarInputRef = useRef(null)
  const previousPayload = useRef(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [about, setAbout] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [avatarSrc, setAvatarSrc] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [experience, setExperience] = useState([])
  const [education, setEducation] = useState([])
  const [history, setHistory] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [onChainCid, setOnChainCid] = useState(null)

  
  const profileKey = address ? `unlinked_profile_${address}` : null
  const historyKey = address ? `unlinked_history_${address}` : null
  const cidKey = address ? `unlinked_cid_${address}` : null
  const deletedKey = address ? `unlinked_deleted_${address}` : null

  function saveProfileToLocal(data) {
    if (!profileKey) return
    try { localStorage.setItem(profileKey, JSON.stringify(data)) } catch {}
  }

  function loadProfileFromLocal() {
    if (!profileKey) return null
    try {
      const raw = localStorage.getItem(profileKey)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }

  function saveLatestCid(cid) {
    if (!cidKey) return
    try { localStorage.setItem(cidKey, cid) } catch {}
  }

  function loadLatestCid() {
    if (!cidKey) return null
    try { return localStorage.getItem(cidKey) } catch { return null }
  }

  function saveHistoryToLocal(h) {
    if (!historyKey) return
    try { localStorage.setItem(historyKey, JSON.stringify(h)) } catch {}
  }

  function loadHistoryFromLocal() {
    if (!historyKey) return []
    try {
      const raw = localStorage.getItem(historyKey)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }

  
  const historyInitialized = useRef(false)
  useEffect(() => {
    if (!historyInitialized.current) return
    saveHistoryToLocal(history)
  }, [history, historyKey])

  
  function populateFields(data) {
    setFirstName(data.firstName || '')
    setLastName(data.lastName || '')
    setAbout(data.about || '')
    setLocation(data.location || '')
    setWebsite(data.website || '')
    setSkills(data.skills || [])
    setAvatarSrc(data.avatar || null)
    setExperience((data.experience || []).map(e => ({ ...e, id: nextId.current++ })))
    setEducation((data.education || []).map(e => ({ ...e, id: nextId.current++ })))

    previousPayload.current = {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      about: data.about || '',
      location: data.location || '',
      website: data.website || '',
      skills: data.skills || [],
      avatar: data.avatar || null,
      experience: data.experience || [],
      education: data.education || [],
    }
  }

  
  useEffect(() => {
    if (!address) return

    async function load() {
      setLoading(true)

      if (deletedKey && localStorage.getItem(deletedKey)) {
        setLoading(false)
        return
      }

      const localHistory = loadHistoryFromLocal()
      if (localHistory.length > 0) {
        setHistory(localHistory)
      }
      historyInitialized.current = true

      let onChain = null
      try {
        onChain = await fetchProfileFromChain(address)
      } catch (err) {
        console.error('[profile] Chain fetch error:', err)
      }

      let raw = onChain?.cid || null
      const localRaw = loadLatestCid()
      if (localRaw && localRaw !== raw) {
        raw = localRaw
      }

      if (raw) {
        setOnChainCid(raw)
        const parsed = parseOnChainValue(raw)

        if (parsed) {
          let ipfsData = null
          const ipfsCid = parsed.cid
          for (let i = 0; i < 3; i++) {
            try {
              const res = await fetch(gatewayUrl(ipfsCid))
              if (res.ok) {
                if (parsed.encrypted) {
                  const encryptedBuffer = await res.arrayBuffer()
                  ipfsData = await decryptProfile(parsed.keyB64, parsed.ivB64, encryptedBuffer)
                } else {
                  ipfsData = await res.json()
                }
                break
              }
              console.warn(`[profile] IPFS attempt ${i + 1}/3: ${res.status}`)
            } catch (err) {
              console.warn(`[profile] IPFS attempt ${i + 1}/3:`, err.message)
            }
            if (i < 2) await new Promise(r => setTimeout(r, 1500))
          }

          if (ipfsData) {
            populateFields(ipfsData)
            saveProfileToLocal(ipfsData)
            const hasLocalHistoryKey = historyKey && localStorage.getItem(historyKey) !== null
            if (ipfsData.history?.length > 0 && !hasLocalHistoryKey) {
              setHistory(ipfsData.history)
            }
            setLoading(false)
            return
          }
        }
      }

      const local = loadProfileFromLocal()
      if (local) {
        populateFields(local)
      }

      setLoading(false)
    }

    load()
  }, [address])

  function addSkill(e) {
    e.preventDefault()
    const vals = skillInput.split(',').map(s => s.trim()).filter(Boolean)
    const toAdd = vals.filter(v => v.length <= 20 && !skills.includes(v))
    const remaining = 8 - skills.length
    if (toAdd.length > 0) {
      setSkills([...skills, ...toAdd.slice(0, remaining)])
    }
    setSkillInput('')
  }

  function removeSkill(skill) {
    setSkills(skills.filter(s => s !== skill))
  }

  function addExperience() {
    setExperience([...experience, { id: nextId.current++, title: '', company: '', startDate: '', endDate: '' }])
  }

  function updateExperience(id, field, value) {
    setExperience(experience.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  function removeExperience(id) {
    setExperience(experience.filter(e => e.id !== id))
  }

  function addEducation() {
    setEducation([...education, { id: nextId.current++, school: '', degree: '', startDate: '', endDate: '' }])
  }

  function updateEducation(id, field, value) {
    setEducation(education.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  function removeEducation(id) {
    setEducation(education.filter(e => e.id !== id))
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = ev => setAvatarSrc(ev.target.result)
    reader.readAsDataURL(file)
  }

  function buildPayload() {
    return {
      firstName,
      lastName,
      about,
      location,
      website,
      skills,
      avatar: avatarSrc,
      experience: experience.map(({ id, ...rest }) => rest),
      education: education.map(({ id, ...rest }) => rest),
      history: history.map(({ id, timestamp, message, txSignature, cid }) => ({
        id, timestamp, message, txSignature, cid,
      })),
    }
  }

  const saveProfile = useCallback(async () => {
    const payload = buildPayload()
    const prev = previousPayload.current

    let message
    if (!prev) {
      message = 'Initial profile'
    } else {
      message = generateCommitMessage(prev, payload)
    }

    if (!message) return

    setSaving(true)
    try {
      
      let avatarCid = null
      if (avatarFile) {
        avatarCid = await uploadImage(avatarFile)
        setAvatarFile(null)
      }

      const ipfsPayload = {
        ...payload,
        avatar: avatarCid ? gatewayUrl(avatarCid) : payload.avatar,
        avatarCid: avatarCid || null,
      }

      const { keyB64, ivB64, encryptedBlob } = await encryptProfile(ipfsPayload)
      const encFile = new File([encryptedBlob], 'profile.enc', { type: 'application/octet-stream' })
      const metadataCid = await uploadFile(encFile)

      const onChainValue = buildOnChainValue(keyB64, ivB64, metadataCid)
      const txSignature = await saveProfileOnChain(onChainValue)

      saveProfileToLocal(ipfsPayload)
      saveLatestCid(onChainValue)
      if (deletedKey) try { localStorage.removeItem(deletedKey) } catch {}

      if (avatarCid) {
        setAvatarSrc(gatewayUrl(avatarCid))
      }

      const entry = {
        id: generateShortHash(),
        timestamp: new Date().toISOString(),
        message,
        txSignature,
        cid: metadataCid,
        payload: structuredClone(ipfsPayload),
      }
      setHistory(h => [entry, ...h])
      setOnChainCid(onChainValue)
      previousPayload.current = structuredClone(ipfsPayload)
    } catch (err) {
      console.error('[profile] Save failed:', err)
      alert('Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  })

  const rollback = useCallback((entry) => {
    const { payload } = entry

    const currentPayload = buildPayload()
    if (JSON.stringify(currentPayload) === JSON.stringify(payload)) {
      console.log('Already at this version state')
      return
    }

    setFirstName(payload.firstName || '')
    setLastName(payload.lastName || '')
    setAbout(payload.about || '')
    setLocation(payload.location || '')
    setWebsite(payload.website || '')
    setSkills(payload.skills || [])
    setAvatarSrc(payload.avatar || null)

    setExperience((payload.experience || []).map(e => ({ ...e, id: nextId.current++ })))
    setEducation((payload.education || []).map(e => ({ ...e, id: nextId.current++ })))

    const newEntry = {
      id: generateShortHash(),
      timestamp: new Date().toISOString(),
      message: `Rolled back to version ${entry.id}`,
      payload: structuredClone(payload),
    }
    setHistory(h => [newEntry, ...h])
    previousPayload.current = structuredClone(payload)
  }, [firstName, lastName, about, location, website, skills, avatarSrc, experience, education])

  function clearSiteData() {
    document.cookie.split(';').forEach(c => {
      document.cookie = c.trim().replace(/=.*/, '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/')
    })
    try { sessionStorage.clear() } catch {}
  }

  async function deleteHistoryEntry(id) {
    const entry = history.find(e => e.id === id)
    if (entry) {
      if (entry.cid) unpinCid(entry.cid)
      if (entry.payload?.avatarCid) unpinCid(entry.payload.avatarCid)
    }
    const updated = history.filter(e => e.id !== id)
    if (updated.length === 0) {
      return clearHistory()
    }
    saveHistoryToLocal(updated)
    setHistory(updated)
  }

  async function clearHistory() {
    // Destroy encryption key on-chain (writes empty string)
    try {
      await saveProfileOnChain('')
    } catch (err) {
      console.error('[profile] Failed to destroy key on-chain:', err)
      alert('Failed to destroy encryption key: ' + err.message)
      return
    }

    // Unpin all CIDs from Pinata
    const unpins = []
    for (const entry of history) {
      if (entry.cid) unpins.push(unpinCid(entry.cid))
      if (entry.payload?.avatarCid) unpins.push(unpinCid(entry.payload.avatarCid))
    }
    if (onChainCid) {
      const parsed = parseOnChainValue(onChainCid)
      if (parsed) unpins.push(unpinCid(parsed.cid))
    }
    await Promise.allSettled(unpins)

    if (profileKey) try { localStorage.removeItem(profileKey) } catch {}
    if (historyKey) try { localStorage.removeItem(historyKey) } catch {}
    if (cidKey) try { localStorage.removeItem(cidKey) } catch {}
    if (deletedKey) try { localStorage.setItem(deletedKey, '1') } catch {}

    clearSiteData()

    setFirstName('')
    setLastName('')
    setAbout('')
    setLocation('')
    setWebsite('')
    setSkills([])
    setAvatarSrc(null)
    setAvatarFile(null)
    setExperience([])
    setEducation([])
    setHistory([])
    setOnChainCid(null)
    previousPayload.current = null
  }

  return {
    firstName, setFirstName,
    lastName, setLastName,
    about, setAbout,
    location, setLocation,
    website, setWebsite,
    skills, skillInput, setSkillInput,
    avatarSrc, setAvatarSrc, avatarInputRef,
    experience, education,
    history,
    saving, loading,
    addSkill, removeSkill,
    addExperience, updateExperience, removeExperience,
    addEducation, updateEducation, removeEducation,
    handleAvatarChange,
    buildPayload,
    saveProfile,
    rollback,
    deleteHistoryEntry,
    clearHistory,
  }
}
