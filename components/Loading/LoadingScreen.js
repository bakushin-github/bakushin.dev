"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import "./LoadingScreen.scss";

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    let timer;

    if (progress < 99) {
      timer = setTimeout(() => {
        setProgress(progress + 1);
      }, 15);
    } else if (progress === 99) {
      timer = setTimeout(() => {
        setProgress(100);

        // 100%表示後2秒で完了開始
        setTimeout(() => {
          setIsCompleting(true);

          // CSS transitionの時間を考慮して少し遅らせる
          setTimeout(() => {
            if (onComplete) {
              onComplete();
            }
          }, 400); // アニメーション時間(0.4s)に合わせる
        }, 2000);
      }, 1500);
    }

    return () => clearTimeout(timer);
  }, [progress, onComplete]);

  // 数字と%を分離してフォーマット
  const formatNumberAndPercent = (num) => {
    if (num === 100) {
      return { number: "100", percent: "%" };
    }
    return { number: num.toString().padStart(2, "0"), percent: "%" };
  };

  const { number, percent } = formatNumberAndPercent(progress);

  return (
    <div
      className={`loading-screen ${
        isCompleting ? "loading-screen--completing" : ""
      }`}
    >
      <div className="loading-screen__progress-container">
        <div className="loading-screen__progress-display">
          <div className="loading-screen__progress-number">{number}</div>
          <div className="loading-screen__progress-percent">{percent}</div>
          {/* 100%になったらロゴ表示 */}
          {progress === 100 && (
            <div className="loading-screen__logo">
              <img
                src="/DrawerMenu/PC/logo.webp"
                alt="Logo"
                width="170.182"
                height="48"
                onError={(e) => {
                  console.error("Logo image failed to load:", e.target.src);
                  // フォールバック: 画像が読み込めない場合は非表示
                  e.target.style.display = "none";
                }}
                onLoad={() => {
                  console.log("Logo image loaded successfully");
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
