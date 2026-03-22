import styles from './LinkedInCallout.module.scss'

import coinsSvg from 'pixelarticons/svg/coins.svg?raw'
import usersSvg from 'pixelarticons/svg/users.svg?raw'
import cancelSvg from 'pixelarticons/svg/cancel.svg?raw'

const stats = [
  { value: '$17B', label: 'LinkedIn annual revenue', icon: coinsSvg },
  { value: '1B+', label: 'profiles monetized', icon: usersSvg },
  { value: '$0', label: 'paid to you', icon: cancelSvg },
]

function LinkedInCallout() {
  return (
    <section className={styles.stats}>
      <div className={styles.grid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.card}>
            <span className={styles.icon} dangerouslySetInnerHTML={{ __html: stat.icon }} />
            <span className={styles.value}>{stat.value}</span>
            <span className={styles.label}>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default LinkedInCallout
