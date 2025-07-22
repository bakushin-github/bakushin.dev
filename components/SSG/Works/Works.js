// "use client";
import React from "react";
import { Noto_Sans_JP } from "next/font/google";
import variablestyles from "../../../app/styles/_variables.module.scss";
import styles from "./Works.module.scss";
import Image from "next/image";
import Link from "next/link";
import H2 from "../H2/H2";
import SwiperGallery from "./SwiperGallery";
import ListViewButton from "../ListViewButton/ListViewButton";

function Works() {
  return (
    <>
      {/* idを削除し、classNameのみ使用 */}
      <div className={styles.works}>
        <div className={styles.works__inner}>
          <H2
            subText="制作実績"
            mainText="Works"
            className={styles.works__title}
          ></H2>
        </div>
        <SwiperGallery />

      </div>
    </>
  );
}

export default Works;