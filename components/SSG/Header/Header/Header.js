/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Noto_Sans_JP } from "next/font/google";
import variablestyles from "../../../../app/styles/_variables.module.scss";
import styles from "./Header.module.scss";
import Image from "next/image";
import Link from "next/link";
import Contact_button from "../../Contact_button/Contact_button";

// toggleMenu プロパティを受け取る（使用しないが一貫性のため）
function Header({ toggleMenu }) {
  return (
    <div className={styles.header}>
      <div className={styles.header__inner}>
        <Link href="/#Fv">
          <img
            className={styles.header__logo}
            src="/Header/PC/Logo.webp"
            // width={170.18}
            // height={47.99}
            alt="ロゴ"
            // priority={true}
          />
        </Link>
        <nav className={styles.header__nav}>
          <ul className={styles["header__nav-list"]}>
            <li className={styles.header__navTop}>
              <Link href="/#Fv">Top</Link>
            </li>
            <li>
              <Link href="/#Works">Works</Link>
            </li>
            <li>
              <Link href="/#About">About</Link>
            </li>
          </ul>
          <Contact_button className={styles.header__contact} />
        </nav>
      </div>
    </div>
  );
}

export default Header;