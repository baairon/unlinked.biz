import { PinataSDK } from 'pinata'

export function gatewayUrl(cid) {
  const gateway = import.meta.env.VITE_PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs'
  return `${gateway}/${cid}`
}

let _pinata = null
function getPinata() {
  if (!_pinata) {
    _pinata = new PinataSDK({
      pinataJwt: import.meta.env.VITE_PINATA_JWT,
      pinataGateway: import.meta.env.VITE_PINATA_GATEWAY_URL,
    })
  }
  return _pinata
}

export async function uploadImage(file) {
  const result = await getPinata().upload.public.file(file)
  return result.cid
}

export async function uploadJSON(payload) {
  const result = await getPinata().upload.public.json(payload)
  return result.cid
}

export async function uploadFile(file) {
  const result = await getPinata().upload.public.file(file)
  return result.cid
}

export async function unpinCid(cid) {
  if (!cid) return
  try {
    const files = await getPinata().files.public.list().cid(cid)
    if (files?.length > 0) {
      const fileIds = files.map(f => f.id)
      await getPinata().files.public.delete(fileIds)
    }
  } catch (err) {
    console.error('[ipfs] Failed to unpin CID:', cid, err)
  }
}
