function toBase64url(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64url(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function encryptProfile(payload) {
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plaintext = new TextEncoder().encode(JSON.stringify(payload))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)
  const keyB64 = toBase64url(await crypto.subtle.exportKey('raw', key))
  const ivB64 = toBase64url(iv)
  return { keyB64, ivB64, encryptedBlob: new Uint8Array(ciphertext) }
}

export async function decryptProfile(keyB64, ivB64, encryptedBuffer) {
  const keyRaw = fromBase64url(keyB64)
  const key = await crypto.subtle.importKey('raw', keyRaw, 'AES-GCM', false, ['decrypt'])
  const iv = fromBase64url(ivB64)
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedBuffer)
  return JSON.parse(new TextDecoder().decode(decrypted))
}

export function parseOnChainValue(raw) {
  if (!raw) return null
  if (raw.includes('.')) {
    const parts = raw.split('.')
    if (parts.length === 3) {
      return { encrypted: true, keyB64: parts[0], ivB64: parts[1], cid: parts[2] }
    }
  }
  return { encrypted: false, cid: raw }
}

export function buildOnChainValue(keyB64, ivB64, cid) {
  return `${keyB64}.${ivB64}.${cid}`
}
