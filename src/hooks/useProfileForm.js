import { useState, useRef, useCallback } from 'react'

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

export function useProfileForm() {
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
  const [experience, setExperience] = useState([])
  const [education, setEducation] = useState([])
  const [history, setHistory] = useState([])

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
    }
  }

  const saveProfile = useCallback(() => {
    const payload = buildPayload()
    const prev = previousPayload.current

    let message
    if (!prev) {
      message = 'Initial profile'
    } else {
      message = generateCommitMessage(prev, payload)
    }

    if (message) {
      const entry = {
        id: generateShortHash(),
        timestamp: new Date().toISOString(),
        message,
        payload: structuredClone(payload),
      }
      setHistory(h => [entry, ...h])
    }

    previousPayload.current = structuredClone(payload)
    console.log('Profile payload:', payload)
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

  function deleteHistoryEntry(id) {
    setHistory(h => h.filter(e => e.id !== id))
  }

  function clearHistory() {
    setHistory([])
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
    addSkill, removeSkill,
    addExperience, updateExperience, removeExperience,
    addEducation, updateEducation, removeEducation,
    handleAvatarChange,
    buildPayload,
    saveProfile,
    deleteHistoryEntry,
    clearHistory,
  }
}
