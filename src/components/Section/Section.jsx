import styles from './Section.module.scss'

function Section({ title, children }) {
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

export default Section
