"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import styles from "./page.module.scss";
import H2 from "@/components/SSG/H2/H2";
import WorkOthers from "@/components/FetchLowerLayer/WorkOther";
import ListViewButton from "@/components/SSG/ListViewButton/ListViewButton";
import { ScrollMotion } from "@/components/animation/Stagger/ScrollMotion";

// 開発環境でのみログを表示するヘルパー関数
const devLog = (message, ...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
};

export default function WorkDetailClient({ work, slug, breadcrumbItems, currentWorkId }) {
  const [showBackgroundImage, setShowBackgroundImage] = useState(false);
  const [showCategoryAndTitle, setShowCategoryAndTitle] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const imageScrollMotionRef = useRef(null);
  const contentScrollMotionRef = useRef(null);

  // デバッグログ: コンポーネントがレンダリングされるたびに表示
  devLog("WorkDetailClient is rendering. Current work:", work?.title);
  devLog("Current work ID:", currentWorkId);
  devLog("Current showBackgroundImage state:", showBackgroundImage);
  devLog("Current showCategoryAndTitle state:", showCategoryAndTitle);

  useEffect(() => {
    if (!work) {
      devLog("useEffect: Work data is not available, skipping observer setup.");
      return;
    }

    devLog("useEffect: Setting up Intersection Observer...");
    
    // より簡単なアプローチ：画像要素のみを監視してバックグラウンドアニメーションをトリガー
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          devLog("Background animation trigger - isIntersecting:", entry.isIntersecting);
          if (entry.isIntersecting && !showBackgroundImage) {
            devLog("SUCCESS: Triggering background animation!");
            setShowBackgroundImage(true);
            observer.disconnect(); // 一度トリガーされたら監視を停止
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' } // より確実な検出のため
    );

    // 少し遅延してからrefをチェック
    const checkAndObserve = () => {
      if (imageScrollMotionRef.current) {
        observer.observe(imageScrollMotionRef.current);
        devLog("useEffect: Observing imageScrollMotionRef.current");
      } else {
        devLog("useEffect: imageScrollMotionRef.current is null, retrying...");
        setTimeout(checkAndObserve, 100); // 100ms後に再試行
      }
    };

    checkAndObserve();

    return () => {
      devLog("useEffect Cleanup: Observer disconnected.");
      observer.disconnect();
    };
  }, [work, showBackgroundImage]);

  // 背景アニメーションの後にカテゴリとタイトルのアニメーションをトリガーするエフェクト
  useEffect(() => {
    if (showBackgroundImage) {
      devLog(
        "useEffect (showCategoryAndTitle): showBackgroundImage is true. Setting showCategoryAndTitle with a delay."
      );
      const timer = setTimeout(() => {
        setShowCategoryAndTitle(true);
        devLog(
          "useEffect (showCategoryAndTitle): showCategoryAndTitle set to true after delay."
        );
      }, 1400);

      return () => {
        clearTimeout(timer);
        devLog("useEffect (showCategoryAndTitle): Timer cleared.");
      };
    } else {
      devLog(
        "useEffect (showCategoryAndTitle): showBackgroundImage is false, not setting showCategoryAndTitle."
      );
    }
  }, [showBackgroundImage]);

  // 動画自動再生の初期化（より直接的なアプローチ）
  useEffect(() => {
    devLog("Direct video initialization useEffect triggered");
    
    const initializeVideos = () => {
      devLog("Searching for video elements...");
      
      // 複数のセレクタで動画要素を検索
      const selectors = ['.lazy-video', 'video[data-src]', 'video.acf-video', 'video'];
      let allVideos = [];
      
      selectors.forEach(selector => {
        const videos = document.querySelectorAll(selector);
        videos.forEach(video => {
          if (!allVideos.includes(video)) {
            allVideos.push(video);
          }
        });
      });
      
      devLog("Direct approach - found videos:", allVideos.length);
      
      allVideos.forEach((video, index) => {
        devLog(`Direct - Video ${index}:`, {
          src: video.src,
          dataSrc: video.dataset.src,
          paused: video.paused,
          currentTime: video.currentTime,
          readyState: video.readyState,
          autoplay: video.autoplay,
          muted: video.muted
        });
        
        // data-src から src に変換
        if (video.dataset.src && !video.src) {
          video.src = video.dataset.src;
          video.removeAttribute('data-src');
          devLog(`Direct - Set video ${index} src to:`, video.src);
        }
        
        // 自動再生属性を設定
        video.muted = true;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        
        // 再生を試行
        if (video.paused) {
          devLog(`Direct - Attempting to play video ${index}`);
          
          const playVideo = () => {
            video.play().then(() => {
              devLog(`Direct - Video ${index} playback SUCCESS`);
            }).catch(error => {
              console.error(`Direct - Video ${index} playback failed:`, error.message);
              
              // ユーザーインタラクション後に再生
              const playOnClick = () => {
                video.play().then(() => {
                  devLog(`Direct - Video ${index} started after user interaction`);
                }).catch(e => {
                  console.error(`Direct - Video ${index} still failed after interaction:`, e);
                });
                document.removeEventListener('click', playOnClick);
                document.removeEventListener('touchstart', playOnClick);
              };
              
              document.addEventListener('click', playOnClick, { once: true });
              document.addEventListener('touchstart', playOnClick, { once: true });
            });
          };
          
          // 即座に再生を試行
          playVideo();
          
          // loadイベントでも再生を試行
          video.addEventListener('loadeddata', playVideo, { once: true });
          
          // 強制的にload
          video.load();
        }
      });
    };
    
    // 複数のタイミングで実行
    const timeouts = [
      setTimeout(initializeVideos, 100),
      setTimeout(initializeVideos, 500),
      setTimeout(initializeVideos, 1000),
      setTimeout(initializeVideos, 2000)
    ];
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [work?.content]); // contentが変更されたときに実行

  if (!work) {
    devLog(
      "WorkDetailClient: Work data is null, rendering not found message."
    );
    return (
      <main className={styles.container}>
        <div className={styles.notFound}>
          <h1>作品が見つかりませんでした</h1>
          <p>スラッグ: {slug}</p>
          <Link href="/all-works" className={styles.backButton}>
            全作品一覧に戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <H2 subText="制作実績" mainText="Work" className={styles.work__h2} />
      <article className={styles.workDetail}>
        <div
          className={`${styles.imagePosition} ${
            showBackgroundImage ? styles["animate-background"] : ""
          }`}
        >
          {work.featuredImage?.node && (
            <ScrollMotion
              ref={imageScrollMotionRef}
              delay={0.2}
              duration={0.6}
              yOffset={30}
              threshold={0.3}
              once={true}
            >
              <div className={styles.featuredImage}>
                <img
                  src={work.featuredImage.node.sourceUrl}
                  alt={
                    work.featuredImage.node.altText ||
                    `${work.title}のメイン画像`
                  }
                  width={917}
                  height={450}
                  className={styles.mainImage}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    objectFit: "cover",
                    display: "block",
                    margin: "0 auto",
                  }}
                  loading="eager"
                  decoding="async"
                />
              </div>
            </ScrollMotion>
          )}
        </div>

        {showCategoryAndTitle && (
          <ScrollMotion
            delay={0.3}
            duration={0.6}
            yOffset={30}
            threshold={0.3}
            once={true}
          >
            <header className={styles.workCategoryH1}>
              <span className={styles.worksCategory}>
                {work.categories?.nodes?.map((category, index) => (
                  <span key={category.id}>
                    {index > 0 ? ", " : ""}
                    {category.name}
                  </span>
                ))}
              </span>
              <h1 className={styles.worksTitle}>{work.title}</h1>
            </header>
          </ScrollMotion>
        )}

        <ScrollMotion
          ref={contentScrollMotionRef}
          delay={0.2}
          duration={0.6}
          yOffset={30}
          threshold={0.3}
          once={true}
        >
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: work.content }}
          />
        </ScrollMotion>
        
        <figure className={styles.thumbnailMove}></figure>
        
        <div className={styles.videoBox}>
          {/* 動画を確実に再生するスクリプト */}
          <Script 
            id="lazy-video-autoplay" 
            strategy="afterInteractive"
          >
            {`
              console.log("Guaranteed video playback script loaded");
              
              function forcePlayVideo(video, index) {
                console.log("Force playing video", index, ":", video);
                
                // データ属性から実際のsrcに変換
                if (video.dataset.src && !video.src) {
                  video.src = video.dataset.src;
                  video.removeAttribute('data-src');
                  console.log("Set video src to:", video.src);
                }
                
                // 自動再生に必要な属性を強制設定
                video.muted = true;
                video.autoplay = true;
                video.loop = true;
                video.playsInline = true;
                video.controls = false; // コントロールを一時的に無効化
                
                // 複数の方法で再生を試行
                const playAttempts = [
                  // 方法1: 即座に再生
                  () => {
                    return video.play().then(() => {
                      console.log("Video", index, "immediate play SUCCESS");
                      return true;
                    }).catch(err => {
                      console.log("Video", index, "immediate play failed:", err.message);
                      return false;
                    });
                  },
                  
                  // 方法2: loadイベント後に再生
                  () => {
                    return new Promise((resolve) => {
                      const onLoadedData = () => {
                        video.removeEventListener('loadeddata', onLoadedData);
                        video.play().then(() => {
                          console.log("Video", index, "loadeddata play SUCCESS");
                          resolve(true);
                        }).catch(err => {
                          console.log("Video", index, "loadeddata play failed:", err.message);
                          resolve(false);
                        });
                      };
                      video.addEventListener('loadeddata', onLoadedData);
                      video.load();
                    });
                  },
                  
                  // 方法3: 少し待ってから再生
                  () => {
                    return new Promise((resolve) => {
                      setTimeout(() => {
                        video.play().then(() => {
                          console.log("Video", index, "delayed play SUCCESS");
                          resolve(true);
                        }).catch(err => {
                          console.log("Video", index, "delayed play failed:", err.message);
                          resolve(false);
                        });
                      }, 500);
                    });
                  }
                ];
                
                // 順番に再生を試行
                async function tryPlayMethods() {
                  for (let i = 0; i < playAttempts.length; i++) {
                    console.log("Trying play method", i + 1, "for video", index);
                    const success = await playAttempts[i]();
                    if (success) {
                      video.controls = true; // 再生成功後にコントロールを表示
                      return;
                    }
                  }
                  
                  // 全ての方法が失敗した場合、ユーザーインタラクション待ち
                  console.log("All auto-play methods failed for video", index, "waiting for user interaction");
                  const playOnClick = () => {
                    video.play().then(() => {
                      console.log("Video", index, "started after user click");
                      video.controls = true;
                      document.removeEventListener('click', playOnClick);
                      document.removeEventListener('touchstart', playOnClick);
                    }).catch(e => console.error("Video", index, "still failed after user interaction:", e));
                  };
                  
                  document.addEventListener('click', playOnClick, { once: true });
                  document.addEventListener('touchstart', playOnClick, { once: true });
                  video.controls = true; // ユーザーが手動で再生できるように
                }
                
                tryPlayMethods();
              }
              
              function findAndPlayAllVideos() {
                const selectors = [
                  '.lazy-video',
                  'video[data-src]',
                  'video.acf-video',
                  'video'
                ];
                
                let foundVideos = [];
                selectors.forEach(selector => {
                  const videos = document.querySelectorAll(selector);
                  videos.forEach(video => {
                    if (!foundVideos.includes(video)) {
                      foundVideos.push(video);
                    }
                  });
                });
                
                console.log("Force play - found videos:", foundVideos.length);
                
                foundVideos.forEach((video, index) => {
                  console.log("Force play - Video", index, "details:", {
                    src: video.src,
                    dataSrc: video.dataset.src,
                    paused: video.paused,
                    readyState: video.readyState,
                    currentTime: video.currentTime
                  });
                  
                  // まだ再生されていない動画のみ処理
                  if (video.paused && !video.dataset.forceInitialized) {
                    video.dataset.forceInitialized = 'true';
                    forcePlayVideo(video, index);
                  }
                });
                
                return foundVideos.length;
              }
              
              // 初回実行（短い遅延後）
              setTimeout(() => {
                console.log("Starting initial video force play check");
                findAndPlayAllVideos();
              }, 100);
              
              // 2回目の実行（コンテンツ読み込み完了後）
              setTimeout(() => {
                console.log("Starting secondary video force play check");
                findAndPlayAllVideos();
              }, 1000);
              
              // 3回目の実行（確実に実行）
              setTimeout(() => {
                console.log("Starting final video force play check");
                findAndPlayAllVideos();
              }, 3000);
              
              // スクロール時にも再チェック（動画が view に入った時）
              let scrollTimeout;
              window.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                  const videos = document.querySelectorAll('video');
                  videos.forEach((video, index) => {
                    if (video.paused && video.dataset.src) {
                      const rect = video.getBoundingClientRect();
                      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                      if (isVisible && !video.dataset.scrollInitialized) {
                        console.log("Video", index, "became visible on scroll, trying to play");
                        video.dataset.scrollInitialized = 'true';
                        forcePlayVideo(video, index);
                      }
                    }
                  });
                }, 200);
              });
            `}
          </Script>
        </div>
        
        <section className={styles.relationWorks}>
          <H2
            subText="制作実績"
            mainText="Others"
            className={styles.work__h2Others}
          />
          {/* ★ currentWorkIdを渡して現在の作品を除外 */}
          <WorkOthers currentWorkId={currentWorkId} />
          <div className={styles.workOthersListButton}>
            <ListViewButton href="/all-works" />
          </div>
        </section>
      </article>
    </main>
  );
}