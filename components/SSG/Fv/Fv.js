"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FvTextImage from "../../../components/animation/Fv_text_image.js";
import styles from "./FV.module.scss";
import { useLoadingContext } from "@/components/Loading/ClientWrapper";
import Header_Sp from "../Drawer/Sp/Drawer_menu/Drawer_menuSP.js";

// 開発環境でのみログを出力
const log = (msg, data) => {
  if (process.env.NODE_ENV === 'development') {
    if (data !== undefined) {
      console.log(msg, data);
    } else {
      console.log(msg);
    }
  }
};

function Fv() {
  const { shouldTriggerAnimation, isLoadingComplete } = useLoadingContext();
  log(
    "LOG: Fv component rendered (REVISED VERSION). shouldTriggerAnimation:",
    shouldTriggerAnimation,
    "isLoadingComplete:",
    isLoadingComplete
  );

  // Header_Sp用のメニュー開閉状態
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // メニューの開閉を切り替える関数
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const [aElementsComplete, setAElementsComplete] = useState(false);
  const [bElementsComplete, setBElementsComplete] = useState(false);
  const [imageTextAnimationComplete, setImageTextAnimationComplete] =
    useState(false);

  // A要素の完了状態をより詳細に追跡
  const [aElementsStatus, setAElementsStatus] = useState({
    header_line_pc: false, // PC用ヘッダーライン
    header_line_sp: false, // SP用ヘッダーライン
    left_line_pc: false, // PC用左ライン
    left_line_sp: false, // SP用左ライン
    right_line_pc: false, // PC用右ライン
    right_line_sp: false, // SP用右ライン
  });

  // B要素の完了状態をより詳細に追跡
  const [bElementsStatus, setBElementsStatus] = useState({
    header_ball_pc: false,
    header_ball_sp: false,
    right_polygon_left_pc: false,
    right_polygon_left_sp: false,
    right_polygon_right_pc: false, // 追加
    right_polygon_right_sp: false, // 追加
  });

  // Image/Text要素の完了状態をより詳細に追跡
  const [imageTextStatus, setImageTextStatus] = useState({
    fv_image: false,
    fv__text: false,
  });

  log(
    "LOG: Current State Flags - aElementsComplete:",
    aElementsComplete,
    "bElementsComplete:",
    bElementsComplete,
    "imageTextAnimationComplete:",
    imageTextAnimationComplete
  );
  log("LOG: Current aElementsStatus:", JSON.stringify(aElementsStatus));
  log("LOG: Current bElementsStatus:", JSON.stringify(bElementsStatus));
  log("LOG: Current imageTextStatus:", JSON.stringify(imageTextStatus));

  // A要素の完了を監視
  useEffect(() => {
    log(
      "LOG: useEffect for aElementsStatus triggered. Current aElementsStatus:",
      JSON.stringify(aElementsStatus),
      "shouldTriggerAnimation:",
      shouldTriggerAnimation
    );
    const allAElementsCompleted = Object.values(aElementsStatus).every(
      (status) => status
    );
    if (allAElementsCompleted && shouldTriggerAnimation) {
      if (!aElementsComplete) {
        log(
          "LOG: All A elements reported complete AND shouldTriggerAnimation is true. Setting aElementsComplete to true."
        );
        setAElementsComplete(true);
      }
    }
  }, [aElementsStatus, shouldTriggerAnimation, aElementsComplete]);

  // B要素の完了を監視
  useEffect(() => {
    log(
      "LOG: useEffect for bElementsStatus triggered. Current bElementsStatus:",
      JSON.stringify(bElementsStatus),
      "shouldTriggerAnimation:",
      shouldTriggerAnimation
    );
    const allBElementsCompleted = Object.values(bElementsStatus).every(
      (status) => status
    );
    if (allBElementsCompleted && shouldTriggerAnimation) {
      if (!bElementsComplete) {
        log(
          "LOG: All B elements reported complete AND shouldTriggerAnimation is true. Setting bElementsComplete to true."
        );
        setBElementsComplete(true);
      }
    }
  }, [bElementsStatus, shouldTriggerAnimation, bElementsComplete]);

  // Image/Text要素の完了を監視
  useEffect(() => {
    log(
      "LOG: useEffect for imageTextStatus triggered. Current imageTextStatus:",
      JSON.stringify(imageTextStatus),
      "shouldTriggerAnimation:",
      shouldTriggerAnimation
    );
    const allImageTextElementsCompleted = Object.values(imageTextStatus).every(
      (status) => status
    );
    if (allImageTextElementsCompleted && shouldTriggerAnimation) {
      if (!imageTextAnimationComplete) {
        log(
          "LOG: All Image/Text elements reported complete AND shouldTriggerAnimation is true. Setting imageTextAnimationComplete to true."
        );
        setImageTextAnimationComplete(true);
      }
    }
  }, [imageTextStatus, shouldTriggerAnimation, imageTextAnimationComplete]);

  // --- Framer Motion Variants ---
  const imageTextVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        delayChildren: 0,
        staggerChildren: 0.03,
      },
    },
  };

  const maskAnimationVariants = (direction) => {
    const clipPaths = {
      top: { hidden: "inset(0 0 100% 0)", visible: "inset(0 0 0% 0)" },
      left: { hidden: "inset(0 0 0 100%)", visible: "inset(0 0 0 0%)" }, // 修正: 右から左へ
      right: { hidden: "inset(0 100% 0 0)", visible: "inset(0 0% 0 0)" }, // 修正: 左から右へ
    };

    return {
      hidden: {
        clipPath: clipPaths[direction].hidden,
        opacity: 0, // 開始時は非表示
      },
      visible: {
        clipPath: clipPaths[direction].visible,
        opacity: 1, // 完了時は表示
        transition: {
          duration: 1.2,
          ease: [0, 0, 0.58, 1],
        },
      },
    };
  };

  // A要素の完了ハンドラ
  const handleAElementComplete = (elementName) => {
    log(
      `LOG: handleAElementComplete called for: ${elementName}. shouldTriggerAnimation: ${shouldTriggerAnimation}`
    );
    if (shouldTriggerAnimation) {
      setAElementsStatus((prev) => {
        const newState = { ...prev, [elementName]: true };
        log(
          `LOG: handleAElementComplete - ${elementName}: New aElementsStatus will be:`,
          JSON.stringify(newState)
        );
        return newState;
      });
    }
  };

  // B要素の完了ハンドラ
  const handleBElementComplete = (elementName) => {
    log(
      `LOG: handleBElementComplete called for: ${elementName}. shouldTriggerAnimation: ${shouldTriggerAnimation}`
    );
    if (shouldTriggerAnimation) {
      setBElementsStatus((prev) => {
        const newState = { ...prev, [elementName]: true };
        log(
          `LOG: handleBElementComplete - ${elementName}: New bElementsStatus will be:`,
          JSON.stringify(newState)
        );
        return newState;
      });
    }
  };

  // Image/Text要素の完了ハンドラ
  const handleImageTextComplete = (elementName) => {
    log(
      `LOG: handleImageTextComplete called for: ${elementName}. shouldTriggerAnimation: ${shouldTriggerAnimation}`
    );
    if (shouldTriggerAnimation) {
      setImageTextStatus((prev) => {
        const newState = { ...prev, [elementName]: true };
        log(
          `LOG: handleImageTextComplete - ${elementName}: New imageTextStatus will be:`,
          JSON.stringify(newState)
        );
        return newState;
      });
    }
  };

  // ウィンドウ幅の監視 (既存ロジックを維持)
  const [windowWidth, setWindowWidth] = useState(0);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <>
      <div id="Fv" className={styles.fv} style={{ height: "100vh" }}>
        {/* Header_SpにtoggleMenu関数とisMenuOpen状態を渡す */}
        <Header_Sp toggleMenu={toggleMenu} isMenuOpen={isMenuOpen} />
        {log(
          "LOG: Rendering main animation block. shouldTriggerAnimation:",
          shouldTriggerAnimation
        )}
        {shouldTriggerAnimation && (
          <motion.div className={styles.fv_animation_container}>
            <div className={styles.fv_other_elements_wrapper}>
              {log("LOG: Rendering A Elements group.")}
              {/* A Elements - ライン要素 */}
              <motion.img
                className={styles.fv_header_line}
                src="/Fv/header_line.webp"
                alt="header_line"
                width="194"
                height="178"
                initial="hidden"
                animate="visible"
                variants={maskAnimationVariants("top")}
                onAnimationComplete={() => {
                  log("LOG: fv_header_line (PC) onAnimationComplete");
                  handleAElementComplete("header_line_pc");
                }}
              />

              {/* ▼▼▼ 修正箇所 ▼▼▼ */}
              {/* fv_header_lineSpとfv_header_ballSpを一つのdivで囲む */}
              <div className={styles.fv_header_lineBallSp}>
                <motion.img
                  className={styles.fv_header_lineSp}
                  src="/Fv/Sp/header_line.webp"
                  alt="header_lineSp"
                  initial="hidden"
                  animate="visible"
                  variants={maskAnimationVariants("top")}
                  onAnimationComplete={() => {
                    log("LOG: fv_header_lineSp (SP) onAnimationComplete");
                    handleAElementComplete("header_line_sp");
                  }}
                />
                {/* fv_header_ballSpはA要素完了後に表示する条件を維持 */}
                {aElementsComplete && (
                   <motion.img
                    className={styles.fv_header_ballSp}
                    src="/Fv/Sp/header_ball.webp"
                    alt="header_ballSp"
                    width="23.178"
                    height="23.178"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    onAnimationComplete={() => {
                      log("LOG: fv_header_ballSp (SP) onAnimationComplete");
                      handleBElementComplete("header_ball_sp");
                    }}
                  />
                )}
              </div>
              {/* ▲▲▲ 修正箇所 ▲▲▲ */}

              <>
                <motion.img
                  className={styles.fv_left_linePc}
                  src="/Fv/left_line.webp"
                  alt="left_line_pc"
                  width="390"
                  height="197"
                  initial="hidden"
                  animate="visible"
                  variants={maskAnimationVariants("left")}
                  onAnimationComplete={() => {
                    log("LOG: fv_left_linePc (PC) onAnimationComplete");
                    handleAElementComplete("left_line_pc");
                  }}
                />
                <motion.img
                  className={styles.fv_left_lineSp}
                  src="/Fv/Sp/fv_left_line.webp"
                  alt="left_line_sp"
                  width="156"
                  height="602"
                  initial="hidden"
                  animate="visible"
                  variants={maskAnimationVariants("right")} // SP用も右から左を想定
                  transition={{ duration: 1.2, ease: [0, 0, 0.58, 1] }}
                  onAnimationComplete={() => {
                    log("LOG: fv_left_lineSp (SP) onAnimationComplete");
                    handleAElementComplete("left_line_sp");
                  }}
                />
              </>
              <motion.img
                className={styles.fv_right_line}
                src="/Fv/right_line.webp"
                alt="right_line"
                width="426"
                height="215"
                initial="hidden"
                animate="visible"
                variants={maskAnimationVariants("right")}
                onAnimationComplete={() => {
                  log("LOG: fv_right_line (PC) onAnimationComplete");
                  handleAElementComplete("right_line_pc");
                }}
              />
              <motion.img
                className={styles.fv_right_lineSp}
                src="/Fv/Sp/right_line.webp"
                alt="right_lineSp"
                width="153.10841"
                height="94"
                initial="hidden"
                animate="visible"
                variants={maskAnimationVariants("right")}
                onAnimationComplete={() => {
                  log("LOG: fv_right_lineSp (SP) onAnimationComplete");
                  handleAElementComplete("right_line_sp");
                }}
              />

              {log(
                "LOG: Rendering B Elements group. aElementsComplete:",
                aElementsComplete
              )}
              {/* B Elements - ポリゴン・ボール要素 */}
              {aElementsComplete && (
                <>
                  <motion.img
                    className={styles.fv_header_ball}
                    src="/Fv/header_ball.webp"
                    alt="header_ball"
                    width="44"
                    height="44"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    onAnimationComplete={() => {
                      log("LOG: fv_header_ball (PC) onAnimationComplete");
                      handleBElementComplete("header_ball_pc");
                    }}
                  />
                  {/* ▼▼▼ 修正箇所 ▼▼▼ */}
                  {/* fv_header_ballSp は上でグループ化したため、ここからは削除 */}
                  {/* ▲▲▲ 修正箇所 ▲▲▲ */}
                  <motion.img
                    className={styles.fv_right_polygon_left}
                    src="/Fv/right_polygon_left.webp"
                    alt="right_polygon_left"
                    width="45.24673"
                    height="78.89174"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    onAnimationComplete={() => {
                      log(
                        "LOG: fv_right_polygon_left (PC) onAnimationComplete"
                      );
                      handleBElementComplete("right_polygon_left_pc");
                    }}
                  />
                  <motion.img
                    className={styles.fv_right_polygon_leftSp}
                    src="/Fv/Sp/right_polygon_left.webp"
                    alt="right_polygon_leftSp"
                    width="26.50159"
                    height="46.2079"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    onAnimationComplete={() => {
                      log(
                        "LOG: fv_right_polygon_leftSp (SP) onAnimationComplete"
                      );
                      handleBElementComplete("right_polygon_left_sp");
                    }}
                  />
                  <motion.img
                    className={styles.fv_right_polygon_right}
                    src="/Fv/right_polygon_right.webp"
                    alt="right_polygon_right"
                    width="46.73457"
                    height="81.48592"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    onAnimationComplete={() => {
                      log(
                        "LOG: fv_right_polygon_right (PC) onAnimationComplete"
                      );
                      handleBElementComplete("right_polygon_right_pc"); // onAnimationCompleteを追加
                    }}
                  />
                  <motion.img
                    className={styles.fv_right_polygon_rightSp}
                    src="/Fv/Sp/right_polygon_right.webp"
                    alt="right_polygon_rightSp"
                    width="27.37304"
                    height="47.72735"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    onAnimationComplete={() => {
                      log(
                        "LOG: fv_right_polygon_rightSp (SP) onAnimationComplete"
                      );
                      handleBElementComplete("right_polygon_right_sp"); // onAnimationCompleteを追加
                    }}
                  />
                </>
              )}
<figure className={styles.fv_mainImage}>
              {log(
                "LOG: Rendering Image/Text group. bElementsComplete:",
                bElementsComplete
              )}
              {/* Image/Text Elements */}
              {bElementsComplete && ( // aElementsCompleteではなくbElementsCompleteでトリガー
                <>
                  <motion.div
                    className={styles.fv_image}
                    initial="hidden"
                    animate="visible" // bElementsCompleteでvisibleに切り替え
                    variants={imageTextVariants}
                    onAnimationComplete={() => {
                      log("LOG: fv_image onAnimationComplete");
                      handleImageTextComplete("fv_image");
                    }}
                  >
                    {log(
                      "LOG: Rendering fv_image content. bElementsComplete:",
                      bElementsComplete
                    )}
                    {/* PC用画像 */}
                    <img
                      className={styles.fv_image_pc}
                      src="/Fv/fv_image.webp"
                      alt="ファーストビュー メイン画像"
                    />
                    {/* SP用画像 */}
                    <img
                      className={styles.fv_image_sp}
                      src="/Fv/Sp/fv_image.webp"
                      alt="ファーストビュー メイン画像"
                    />
                  </motion.div>

                  <motion.div
                    className={styles.fv__text}
                    initial="hidden"
                    animate="visible" // bElementsCompleteでvisibleに切り替え
                    variants={imageTextVariants}
                    onAnimationComplete={() => {
                      log("LOG: fv__text onAnimationComplete");
                      handleImageTextComplete("fv__text");
                    }}
                  >
                    {log(
                      "LOG: Rendering fv__text content. bElementsComplete:",
                      bElementsComplete
                    )}
                    <h1 className={styles.fv__text_h1}>
                      <FvTextImage text="ユニークで一番。<br/>理由のある設計。" />
                    </h1>
                    <div className={styles.fv__text_divPC}>
                      <FvTextImage text="すべてのサイトに、理由がある。" />
                      <FvTextImage text="そこから目をそらさず、手を動かしています。" />
                    </div>
                    <div className={styles.fv__text_div}>
                      <FvTextImage text="すべてのサイトに、理由がある。" />
                      <FvTextImage text="そこから目をそらさず、手を動かしています。" />
                    </div>
                  </motion.div>
                </>
              )}
              <div className={styles.fv_svg_wrapper}>
                {log(
                  "LOG: Rendering SVG group. imageTextAnimationComplete:",
                  imageTextAnimationComplete
                )}
                {imageTextAnimationComplete && (
                  <motion.div
                    className={styles.fv__pencil}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {log("LOG: Rendering fv__pencil (SVG) content.")}
                    <svg
                      style={{ width: "100%", height: "100%" }}
                      viewBox="0 0 245 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="none"
                    >
                      <motion.path
                        d="M174.77 4.49061C171.627 4.40999 168.482 4.29372 165.338 4.26788C156.176 4.19684 147.017 4.43579 137.855 4.56819C113.194 4.92987 88.298 4.6554 63.6886 6.53162C63.2472 6.56391 62.8575 6.23128 62.8252 5.78563C62.793 5.34322 63.1248 4.95573 63.5662 4.92021C88.2078 3.04399 113.139 3.31522 137.833 2.95354C143.899 2.86635 149.962 2.73076 156.028 2.67264C127.53 1.0257 98.9775 1.50682 70.47 2.71458C58.5857 3.21835 46.74 3.93528 34.9041 5.09137C31.4377 5.43044 27.9648 5.72753 24.5049 6.13442C35.0039 7.44229 46.0764 6.74154 56.4176 6.71248C77.3641 6.66081 98.317 6.61878 119.26 7.14192C130.79 7.42933 132.478 7.58441 143.564 8.26579C150.883 8.71466 150.687 8.68883 157.339 9.23781C158.238 9.31208 160.567 9.38634 160.892 9.4703C161.24 9.56072 161.398 9.7674 161.469 9.95147C163.57 9.94824 165.673 9.95147 167.774 9.95793C184.97 10.0193 202.09 12.2862 219.231 13.1808C184.938 11.6339 167.767 11.5726 155.445 11.5854C144.26 12.3734 132.842 11.8664 121.693 12.2474C101.323 12.945 80.8337 13.8363 60.5186 15.5091C45.213 16.7685 29.93 18.2055 14.6921 20.1076C10.2785 20.6565 5.88433 21.3346 1.47403 21.9159C1.30006 21.9385 0.845855 22.0031 0.781424 21.9999C0.188659 21.9773 0.0533192 21.5155 0.0211037 21.3767C0.00499591 21.3088 -0.13673 20.6307 0.607448 20.4046C15.5426 15.9127 33.4254 16.0774 48.8244 14.7598C81.2139 11.9891 113.761 10.439 146.292 10.0483"
                        stroke="#000000"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{
                          duration: 2,
                          ease: "easeInOut",
                          delay: 0.3,
                        }}
                      />
                    </svg>
                  </motion.div>
                )}
              </div>
              </figure>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}

export default Fv;