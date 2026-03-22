import styles from './LandingSection.module.scss'

function LandingSection({ title, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {title && <h2 className={styles.title}>{title}</h2>}
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </section>
  )
}

export default LandingSection
