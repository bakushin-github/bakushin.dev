import React from "react";
import { motion } from "framer-motion";
import classNames from "classnames";
import styles from "./Drawer_buttonSP.module.scss";

function Drawer_button({ className, isOpen, toggleDrawer }) {
  const cell = 18; // 中央への距離(px)

  const variants = {
    open: (custom) => getOpenVariant(custom),
    closed: (custom) => getClosedVariant(custom),
  };

  const getOpenVariant = (dot) => {
    switch (dot) {
      case "dot1":
        return { x: cell, y: cell, opacity: 1 };
      case "dot3":
        return { x: -cell, y: cell, opacity: 1 };
      case "dot7":
        return { x: cell, y: -cell, opacity: 1 };
      case "dot9":
        return { x: -cell, y: -cell, opacity: 1 };
      case "dot5": // ★修正点: 中央ドットは開くときも表示されたまま、位置も中央
        return { x: 0, y: 0, opacity: 1 };
      default: // dot2, dot4, dot6, dot8 (中央ドット以外の外周でないドット)
        return { x: 0, y: 0, opacity: 0 }; // フェードアウト
    }
  };

  const getClosedVariant = (dot) => {
    // 閉じる時は全てのドットが元の位置に戻り、表示される
    // dot5 も { x: 0, y: 0, opacity: 1 } となるため、常に表示される
    return { x: 0, y: 0, opacity: 1 };
  };

  const getTransition = (dot) => ({
    type: "spring",
    stiffness: 120, // stiffness は全ドット共通でOK
    damping: 12,
    restDelta: 0.001,
  });

  return (
    <button
      className={`${styles.drawerButton__button} ${className || ""}`}
      onClick={toggleDrawer}
      aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
    >
      <div className={styles.drawerButton__button__inner}>
        {[
          "dot1", "dot2", "dot3",
          "dot4", "dot5", "dot6",
          "dot7", "dot8", "dot9",
        ].map((dotName) => (
          <motion.span
            key={dotName}
            className={classNames(styles.drawerButton__dot, styles[dotName])}
            variants={variants}
            custom={dotName}
            initial="closed" // 初期状態
            animate={isOpen ? "open" : "closed"} // isOpen の状態に応じてアニメーション
            transition={getTransition(dotName)}
          />
        ))}
      </div>
    </button>
  );
}

export default Drawer_button;