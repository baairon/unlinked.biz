import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { PROFILE_IDL } from './profileIdl'

const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROFILE_PROGRAM_ID
)


export function getConnection() {
  const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
  return new Connection(rpcUrl, 'confirmed')
}


export function deriveProfilePDA(walletPubkey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('profile'), walletPubkey.toBuffer()],
    PROGRAM_ID
  )
}


export function getProvider() {
  const connection = getConnection()
  const wallet = window.phantom?.solana
  if (!wallet) throw new Error('Phantom wallet not found')
  return new AnchorProvider(connection, wallet, { commitment: 'confirmed' })
}


export async function saveProfileOnChain(cid) {
  const provider = getProvider()
  const program = new Program(PROFILE_IDL, provider)
  const [profilePda] = deriveProfilePDA(provider.wallet.publicKey)

  const account = await program.account.profileAccount.fetchNullable(profilePda)

  if (!account) {
    return await program.methods
      .initializeProfile(cid)
      .accounts({
        profile: profilePda,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
  } else {
    return await program.methods
      .updateProfile(cid)
      .accounts({
        profile: profilePda,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
  }
}


export async function fetchProfileFromChain(walletAddress) {
  const connection = getConnection()
  const dummyWallet = {
    publicKey: SystemProgram.programId,
    signTransaction: async () => { throw new Error('Read only') },
    signAllTransactions: async () => { throw new Error('Read only') },
  }
  const readOnlyProvider = new AnchorProvider(connection, dummyWallet, { commitment: 'confirmed' })
  const program = new Program(PROFILE_IDL, readOnlyProvider)
  const walletPubkey = new PublicKey(walletAddress)
  const [profilePda] = deriveProfilePDA(walletPubkey)

  let lastError
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const account = await program.account.profileAccount.fetchNullable(profilePda)
      if (!account || !account.cid) return null
      return {
        cid: account.cid,
        version: account.version,
        updatedAt: typeof account.updatedAt?.toNumber === 'function'
          ? account.updatedAt.toNumber()
          : Number(account.updatedAt),
      }
    } catch (err) {
      lastError = err
      console.warn(`[solana] Attempt ${attempt + 1}/3 failed:`, err.message)
      if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * 2 ** attempt))
    }
  }
  throw lastError
}
