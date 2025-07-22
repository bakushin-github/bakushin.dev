"use client";

import React from "react";
import { motion } from "framer-motion";

const contentItemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export const StaggerItem = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <motion.div
      variants={contentItemVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};