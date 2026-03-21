import styles from './Hero.module.scss'

import walletSvg from 'pixelarticons/svg/wallet.svg?raw'
import lockSvg from 'pixelarticons/svg/lock.svg?raw'
import shieldSvg from 'pixelarticons/svg/shield.svg?raw'
import deleteSvg from 'pixelarticons/svg/delete.svg?raw'

const steps = [
  { icon: walletSvg, title: 'Connect Wallet', desc: 'One wallet. No email. No password. Your login and your ownership proof.' },
  { icon: lockSvg, title: 'Encrypted Profile', desc: 'Career history on IPFS, encrypted end-to-end. You choose who sees what.' },
  { icon: shieldSvg, title: 'Provable Reputation', desc: "Reputation built from on-chain activity — what you've actually done, not what you claim." },
  { icon: deleteSvg, title: 'True Deletion', desc: 'Destroy your key. Everything becomes permanently unreadable. By anyone. Including us.' },
]

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          <span className={styles.brand}>unlinked.xyz</span> — Decentralized Alternative to LinkedIn
        </h1>
        <p className={styles.description}>
          A professional network built on Solana, redesigned from the ground up to stop extracting from you.
          Your wallet is your login, your profile is encrypted on IPFS,
          and your reputation is built from verifiable on-chain activity.
          No platform owns your data. No algorithm decides who sees you.
        </p>
      </div>

      <div className={styles.howItWorks}>
        <h2 className={styles.howTitle}>How It Works</h2>
        <div className={styles.grid}>
          {steps.map((step) => (
            <div key={step.title} className={styles.card}>
              <span className={styles.icon} dangerouslySetInnerHTML={{ __html: step.icon }} />
              <h3 className={styles.cardTitle}>{step.title}</h3>
              <p className={styles.cardDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
