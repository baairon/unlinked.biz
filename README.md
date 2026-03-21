## unlinked.xyz

[unlinked-xyz.pages.dev](https://unlinked-xyz.pages.dev/)

A professional network built on Solana where your data belongs to you, cryptographically, not by policy.

Built and shipped solo at **HooHacks 2026**, Accessibility and Empowerment track. Best use case of Solana. Currently in MVP state.

---

## What It Is

**unlinked.xyz** is a front-end only interface to programs deployed on Solana. No centralized backend. No database. All features run directly on-chain.

- Your wallet is your identity
- Your profile is encrypted and stored on IPFS
- Your credentials are verified on-chain
- Every profile update mints a versioned snapshot, like a commit history for your career

Anyone can build on this protocol. Nobody needs our permission.

---

## Why It Exists

LinkedIn made $17B last year by collecting your resume, your network, and your career history, then monetizing it without meaningful consent. A closed-source algorithm decides who sees you. They can suppress your profile, ban it, or feed it into the next model without telling you.

The rise of AI has made this worse. AI didn't create the surveillance problem, but it made your data exponentially more valuable. Your professional history is one of the most valuable datasets that exists: who you know, what you've built, where you've worked, how you think. Every platform that stores it is training models on it right now, and you still own none of it.

**unlinked.xyz** gives that control back to the individual. Want to delete everything? Destroy your encryption key. Mathematically unreadable. Permanently. By anyone. Including us. No one can train on what they can't read.

---

## Why You Should Care

AI is not slowing down. Every major platform is racing to train larger models on more data, and professional data is some of the highest-value training material there is. This is not a bubble that's about to burst. The demand for your career history, your connections, and your expertise is only going to increase. The longer you wait to own your data, the more of it gets extracted without your consent. If you don't control it now, someone else already does.

---

## How It Works

Your profile is stored as JSON on IPFS. The content hash (CID) is written on-chain via a Solana program. Every update produces a new hash, so your full career history is preserved as an immutable sequence of snapshots. You can roll back to any version or cryptographically destroy one by revoking its key.

```
Layer              Technology
──────────────────────────────────────────
Identity           Solana wallet (Phantom)
Profile storage    IPFS via Pinata
State              Solana programs (Anchor)
Interface          React + @solana/wallet-adapter
```

---

## License

MIT
