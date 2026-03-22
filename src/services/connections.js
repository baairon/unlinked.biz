import { PublicKey, SystemProgram } from '@solana/web3.js'
import { Program } from '@coral-xyz/anchor'
import { getConnection, getProvider } from './solana'
import { CONNECTIONS_IDL } from './connectionsIdl'
import bs58 from 'bs58'

const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_CONNECTIONS_PROGRAM_ID || '11111111111111111111111111111111'
)

const ACCOUNT_SIZE = 90


export function deriveConnectionPDA(walletA, walletB) {
  const a = new PublicKey(walletA)
  const b = new PublicKey(walletB)
  const [first, second] = a.toBuffer().compare(b.toBuffer()) < 0 ? [a, b] : [b, a]
  return PublicKey.findProgramAddressSync(
    [Buffer.from('connection'), first.toBuffer(), second.toBuffer()],
    PROGRAM_ID
  )
}


export function orderedKeys(walletA, walletB) {
  const a = new PublicKey(walletA)
  const b = new PublicKey(walletB)
  return a.toBuffer().compare(b.toBuffer()) < 0 ? [a, b] : [b, a]
}

function getProgram() {
  const provider = getProvider()
  return new Program(CONNECTIONS_IDL, provider)
}


export async function sendConnectionRequest(toWallet) {
  const program = getProgram()
  const fromKey = program.provider.wallet.publicKey
  const toKey = new PublicKey(toWallet)
  const [walletA, walletB] = orderedKeys(fromKey, toKey)
  const [pda] = deriveConnectionPDA(fromKey, toKey)

  return await program.methods
    .sendRequest(walletA, walletB)
    .accounts({
      connection: pda,
      from: fromKey,
      to: toKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
}


export async function acceptConnectionRequest(fromWallet) {
  const program = getProgram()
  const toKey = program.provider.wallet.publicKey
  const fromKey = new PublicKey(fromWallet)
  const [walletA, walletB] = orderedKeys(fromKey, toKey)
  const [pda] = deriveConnectionPDA(fromKey, toKey)

  return await program.methods
    .acceptRequest(walletA, walletB)
    .accounts({
      connection: pda,
      to: toKey,
    })
    .rpc()
}


export async function rejectConnectionRequest(otherWallet) {
  const program = getProgram()
  const myKey = program.provider.wallet.publicKey
  const otherKey = new PublicKey(otherWallet)
  const [walletA, walletB] = orderedKeys(myKey, otherKey)
  const [pda] = deriveConnectionPDA(myKey, otherKey)

  return await program.methods
    .rejectRequest(walletA, walletB)
    .accounts({
      connection: pda,
      closer: myKey,
    })
    .rpc()
}


export async function removeConnection(otherWallet) {
  const program = getProgram()
  const myKey = program.provider.wallet.publicKey
  const otherKey = new PublicKey(otherWallet)
  const [walletA, walletB] = orderedKeys(myKey, otherKey)
  const [pda] = deriveConnectionPDA(myKey, otherKey)

  return await program.methods
    .removeConnection(walletA, walletB)
    .accounts({
      connection: pda,
      closer: myKey,
    })
    .rpc()
}


export async function getPendingRequestsForMe(myWallet) {
  const connection = getConnection()
  const myKey = new PublicKey(myWallet)
  try {
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        { dataSize: ACCOUNT_SIZE },
        { memcmp: { offset: 40, bytes: myKey.toBase58() } },
        { memcmp: { offset: 72, bytes: bs58.encode(Buffer.from([0])) } },
      ],
    })
    return accounts.map(({ pubkey, account }) => ({
      pubkey,
      from: new PublicKey(account.data.slice(8, 40)),
      to: new PublicKey(account.data.slice(40, 72)),
      status: account.data[72],
      createdAt: account.data.readBigInt64LE(73),
    }))
  } catch (err) {
    console.error('[connections] getPendingRequestsForMe error:', err)
    return []
  }
}


export async function getMyConnections(myWallet) {
  const connection = getConnection()
  const myKey = new PublicKey(myWallet)
  const acceptedByte = bs58.encode(Buffer.from([1]))
  try {
    const [asFrom, asTo] = await Promise.all([
      connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
          { dataSize: ACCOUNT_SIZE },
          { memcmp: { offset: 8, bytes: myKey.toBase58() } },
          { memcmp: { offset: 72, bytes: acceptedByte } },
        ],
      }),
      connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
          { dataSize: ACCOUNT_SIZE },
          { memcmp: { offset: 40, bytes: myKey.toBase58() } },
          { memcmp: { offset: 72, bytes: acceptedByte } },
        ],
      }),
    ])
    const all = [...asFrom, ...asTo]
    return all.map(({ pubkey, account }) => {
      const from = new PublicKey(account.data.slice(8, 40))
      const to = new PublicKey(account.data.slice(40, 72))
      return {
        pubkey,
        from,
        to,
        otherWallet: from.toBase58() === myKey.toBase58() ? to : from,
      }
    })
  } catch (err) {
    console.error('[connections] getMyConnections error:', err)
    return []
  }
}


export async function getConnectionStatus(myWallet, theirWallet) {
  const connection = getConnection()
  const [pda] = deriveConnectionPDA(myWallet, theirWallet)
  try {
    const accountInfo = await connection.getAccountInfo(pda)
    if (!accountInfo) return 'none'

    const data = accountInfo.data
    const from = new PublicKey(data.slice(8, 40))
    const status = data[72]

    if (status === 1) return 'connected'
    
    const myKey = new PublicKey(myWallet)
    return from.equals(myKey) ? 'pending_sent' : 'pending_received'
  } catch (err) {
    console.error('[connections] getConnectionStatus error:', err)
    return 'none'
  }
}
