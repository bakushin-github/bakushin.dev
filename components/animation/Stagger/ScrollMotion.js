'use client'
// components/animation/Stagger/ScrollMotion.jsx
import React, { useRef, forwardRef } from "react"; // forwardRefをインポート
import { motion, useInView } from "framer-motion";

// forwardRefでコンポーネントをラップ
export const ScrollMotion = forwardRef(({
  children,
  duration = 0.6,
  delay = 0,
  yOffset = 50,
  xOffset = 0,
  threshold = 0.3,
  once = true,
  className = "",
  ...props
}, ref) => { // refを第2引数で受け取る
  // useInViewは内部のrefを使うため、ここでは新しくrefを定義
  const internalRef = useRef(null);
  // refが渡された場合はそちらを優先、なければinternalRefを使う
  const elementRef = ref || internalRef; 

  const isInView = useInView(elementRef, { once, amount: threshold }); // elementRefを監視

  const variants = {
    hidden: { 
      opacity: 0, 
      y: yOffset,
      x: xOffset
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration,
        delay,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      ref={elementRef} // ここでrefをmotion.divにアタッチ
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
});

// コンポーネントの表示名をデバッグ時にわかりやすくするため
ScrollMotion.displayName = 'ScrollMotion';