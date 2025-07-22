import React from 'react'
import styles from './Contact_button.module.scss'
import Image from 'next/image'
import Link from 'next/link'

function Contact_button({ className, style, ...props  }) {
  return (
    <Link href="/contact">
    <button className={`${styles.contact__button} ${className || ''}`}    style={style} // ← styleを適用
      {...props}>
      <Image src="/Header/PC/mail.webp" alt="contact" width={20} height={20} />
      問い合わせる
    </button></Link>
  );
}

export default Contact_button