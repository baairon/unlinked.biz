import Navbar from '../../components/Navbar/Navbar'
import Hero from '../../components/Hero/Hero'
import Stats from '../../components/Stats/Stats'
import Section from '../../components/Section/Section'
import styles from './LandingPage.module.scss'

function LandingPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <Hero />

      <Section title="The Problem">
        <p>LinkedIn made $17 billion last year. They didn't build a product. They built a surveillance machine, and you fed it everything.</p>
        <p>That's not an accident. That's the business model.</p>
      </Section>

      <Stats />

      <Section title="What They Did With It">
        <p>They took your resume, your voice, your network, your career history. Ran it through a model and sold it back to you as LinkedIn Premium. The output?</p>
        <blockquote className={styles.quoted}>"Results-driven professional with a passion for innovation."</blockquote>
        <p>Sound familiar? It should. It sounds like everyone.</p>
        <p>They didn't just store your data. They commodified your voice, dissolved it into a blurred average of everyone else's, and offered it back to you at $40/month — the privilege of sounding like nobody.</p>
        <p>They didn't build a tool for you. They built a data pipeline and sold access to it back to you.</p>
      </Section>

      <Section title="It Gets Worse">
        <p>You don't own your profile. You rent it. A closed-source algorithm decides who sees you. They can suppress it, ban it, feed it into the next model without telling you.</p>
        <p>LinkedIn shut down in China. 50 million people lost their professional identity overnight. No appeal. No recourse. No backup. Because it was never yours.</p>
      </Section>

      <Section title="The Solution">
        <p><span className={styles.brand}>unlinked.xyz</span> is a permissionless professional network built for a privacy-first internet.</p>
        <p>Your wallet is your identity. Your profile is encrypted and stored on IPFS. Your credentials are verified on-chain. Your data belongs to you cryptographically. Not legally, not by policy, by math.</p>
        <p>Want to delete everything? Destroy your encryption key. Mathematically unreadable. Permanently. By anyone. Including us.</p>
        <p>That's not a privacy policy. That's a proof.</p>
      </Section>

      <Section title="Your Career Has a Commit History">
        <p>Every update mints a new snapshot. Every version is yours. Roll back, audit, or cryptographically destroy any state — one transaction.</p>
        <div className={styles.commitLog}>
          <div className={styles.commit}>
            <span className={styles.commitHash}>Qm7xK2…</span>
            <span className={styles.commitMsg}>created profile</span>
            <span className={styles.commitDate}>Mar 24 2025</span>
          </div>
          <div className={styles.commit}>
            <span className={styles.commitHash}>QmB3nF9…</span>
            <span className={styles.commitMsg}>added UVA credential</span>
            <span className={styles.commitDate}>Mar 25 2025</span>
          </div>
          <div className={`${styles.commit} ${styles.commitCurrent}`}>
            <span className={styles.commitHash}>QmR8wZ1…</span>
            <span className={styles.commitMsg}>updated bio</span>
            <span className={styles.commitDate}>Mar 26 2025</span>
          </div>
        </div>
        <p>Your identity. Your repo. Nobody else has commit access.</p>
      </Section>

      <Section title="Your Data Is The Product">
        <p>Your professional history is one of the most valuable datasets that exists. Who you know, what you've built, where you've worked, how you think. Every platform that stores it is training models on it right now.</p>
        <p>AI didn't create the surveillance problem. It made your data exponentially more valuable, and you still own none of it.</p>
        <p>The people building the next era of the internet already understand this. They know that control over your data is control over your future. And they're done handing it to corporations who monetize it without consent.</p>
        <p>A wallet is all you need. No one can ban you from your own wallet. No one can train on what they can't read.</p>
      </Section>

      <Section title="Permissionless By Design">
        <p><span className={styles.brand}>unlinked.xyz</span> is an open source interface to a set of programs deployed on Solana. No central server. No corporation in the middle. All data lives at the protocol level, public, auditable, and owned by you.</p>
        <p>Anyone can build on this protocol. Nobody needs our permission.</p>
      </Section>

    </div>
  )
}

export default LandingPage
