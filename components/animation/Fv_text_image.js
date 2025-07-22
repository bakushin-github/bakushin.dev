'use client';

import React from 'react';
import { motion } from 'framer-motion';

const FvTextImage = ({ text = '', className }) => {
  // 変化を固定するためにuseRefを使用
  const containerRef = React.useRef(null);

  // アニメーションが完了した状態を追跡
  const [animationComplete, setAnimationComplete] = React.useState(false);

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: index * 0.03, 
        duration: 0.3,
      },
    }),
  };

  // アニメーション完了後にスタイルを固定
  React.useEffect(() => {
    if (animationComplete && containerRef.current) {
      // アニメーション完了後の位置を固定
      containerRef.current.style.transform = 'none';
    }
  }, [animationComplete]);

  return (
    <motion.div 
      ref={containerRef}
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { 
            delayChildren: 0,
            staggerChildren: 0.03,
            onComplete: () => setAnimationComplete(true)
          }
        }
      }}
    >
      {(text || '').split(/<br\s*\/?>/i).map((line, lineIndex) => (
        <div key={lineIndex} style={{ display: 'block' }}>
          {line.split('').map((char, charIndex) => (
            <motion.span 
              key={`char-${lineIndex}-${charIndex}`} 
              custom={charIndex} 
              variants={variants}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </div>
      ))}
    </motion.div>
  );
};

export default FvTextImage;