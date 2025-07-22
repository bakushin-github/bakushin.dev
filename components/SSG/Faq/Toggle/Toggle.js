"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./Toggle.module.scss";

export default function Toggle({ content, className }) {
  const [isOpen, setIsOpen] = useState(false); // 初期状態は全て閉じる
  const answerRef = useRef(null);
  const [height, setHeight] = useState("auto");

  useEffect(() => {
    if (!answerRef.current) return;

    if (isOpen) {
      const answerHeight = answerRef.current.scrollHeight;
      setHeight(`${answerHeight}px`);
    } else {
      setHeight("0px");
    }
  }, [isOpen, content]);

  const toggleAccordion = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    <div className={`${styles.qa_box} ${isOpen ? styles.is_open : ""} ${className || ""}`}>
      <div className={styles.qa_box__head} onClick={toggleAccordion}>
        <div className={styles.qa_box__head_wrap}>
          <span className={styles.qa_box__head_text}>{content.title}</span>
        </div>
        <div className={styles.qa_box__move}>
          <span className={styles.qa_box__dash}></span>
          <span className={styles.qa_box__dash2}></span>
        </div>
      </div>

      <div 
        className={styles.qa_box__body} 
        ref={answerRef}
        style={{ height, overflow: "hidden", transition: "height 0.3s ease" }}
      >
        <div className={styles.qa_box__a}>
          <p className={styles.qa_box__a_text}>{content.content}</p>
        </div>
      </div>
    </div>
  );
}
