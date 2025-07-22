import React from 'react'
import styles from './H2.module.scss'

const H2 = ({subText, mainText, className}) => {
  return (
    <div className={`${styles.h2} ${className}`}>
      <div className={styles.h2_subText}>{subText}</div>
      <h2 className={styles.h2_mainText}>{mainText}</h2>
    </div>
  )
}

export default H2