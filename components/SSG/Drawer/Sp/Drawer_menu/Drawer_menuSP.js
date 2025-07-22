/* eslint-disable @next/next/no-img-element */
import React from "react";
import styles from "./Drawer_menuSP.module.scss";
import Image from "next/image";
import Link from "next/link";
import Drawer_button from "../../Drawer_button/Drawer_button";
import Contact_button from "../../../../SSG/Contact_button/Contact_button";
import classNames from "classnames";

// toggleMenuとisMenuOpenプロパティを受け取るようにする
function Header_Sp({ toggleMenu, isMenuOpen }) {
  const closeDrawer = () => {
    if (isMenuOpen) {
      toggleMenu();
    }
  };

  return (
    <>
      {/* ヘッダー部分 */}
      <div className={styles.headerSp}>
        <div className={styles.headerSp__inner}>
          <Link href="/#Fv">
            <Image
              className={styles.headerSp__logo}
              src="/Header/Sp/Logo.webp"
              width={121.27}
              height={34.21}
              alt="ロゴ"
              priority={true}
            />
          </Link>
          <div className={styles.headerSp__button}>
            {/* toggleDrawerプロパティにtoggleMenu関数とisMenuOpen状態を渡す */}
            <Drawer_button
              toggleDrawer={toggleMenu}
              isOpen={isMenuOpen}
              className={styles.headerSP__drawerButton}
            />
          </div>
        </div>
      </div>

      {/* Drawer Menu本体 */}
      <div
        className={classNames(styles.Drawer_menu, {
          [styles.open]: isMenuOpen,
        })}
      >
        <Drawer_button
          className={styles.Drawer_button}
          isOpen={isMenuOpen}
          toggleDrawer={toggleMenu}
        />
        <div className={styles.Drawer_flexLeft}>
          <Image
            src={"/DrawerMenu/PC/1st.webp"}
            alt="□"
            width={125.91254197535207}
            height={125.91254197535207}
            className={styles.Drawer_menu__1}
          />
          <img
            src={"/DrawerMenu/Sp/1st.webp"}
            alt="□"
            className={styles.Drawer_menu__1Sp}
          />
          <Image
            src={"/DrawerMenu/PC/2nd.webp"}
            alt="▽"
            width={170.0053487710697}
            height={170.0053487710697}
            className={styles.Drawer_menu__2}
          />
          <img
            src={"/DrawerMenu/Sp/2nd.webp"}
            alt="▽"
            className={styles.Drawer_menu__2Sp}
          />
          <Image
            src={"/DrawerMenu/PC/3rd.webp"}
            alt="○"
            width={274.34326171875}
            height={274.34326171875}
            className={styles.Drawer_menu__3}
          />
          <img
            src={"/DrawerMenu/Sp/3rd.webp"}
            alt="○"
            className={styles.Drawer_menu__3Sp}
          />
          <Image
            src={"/DrawerMenu/PC/logo.webp"}
            alt="logo"
            width={287.1818542480469}
            height={81.00000762939453}
            className={styles.Drawer_menu__logo}
          />
          <img
            src={"/DrawerMenu/Sp/logo.webp"}
            alt="logoSp"
            className={styles.Drawer_menu__logoSp}
          />
        </div>
        <div className={styles.Drawer_flexRight}>
          <ul className={styles.Drawer_menu__boxInner}>
            <li className={styles.Drawer_menu__List}>
              <Link
                href="/#Fv"
                onClick={closeDrawer}
                className={styles.Drawer_menu__list}
              >
                <span>Top</span>
                <span>→</span>
              </Link>
            </li>

            <li className={styles.Drawer_menu__List}>
              <Link
                href="/#Works"
                onClick={closeDrawer}
                className={styles.Drawer_menu__list}
              >
                <span>Works</span>
                <span>→</span>
              </Link>
            </li>

            <li className={styles.Drawer_menu__List}>
              <Link
                href="/#About"
                onClick={closeDrawer}
                className={styles.Drawer_menu__list}
              >
                <span>About</span>
                <span>→</span>
              </Link>
            </li>
            <div className={styles.Drawer_menu__buttons}>

              <Contact_button className={styles.Drawer_menu__contact} />
            </div>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Header_Sp;