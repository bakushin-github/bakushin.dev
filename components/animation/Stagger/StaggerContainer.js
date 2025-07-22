"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

export const StaggerContainer = ({
  children,
  staggerDelay = 1,
  threshold = 0.3,
  once = true,
  className = "",
  ...props
}) => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once, amount: threshold });

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      ref={sectionRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
