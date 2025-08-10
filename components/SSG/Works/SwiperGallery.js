"use client";
import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import Image from "next/image";
import styles from "./SwiperGallery.module.scss";
import Link from "next/link";
import { useQuery, gql } from "@apollo/client";
import ListViewButton from "../ListViewButton/ListViewButton";
import { useRouter } from "next/navigation";

// GraphQLクエリを更新 - ACFのsliderフィールドとメニュー順序を追加
const GET_WORKS_QUERY = gql`
  query GetWorksQuery {
    works(first: 100, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        id
        title
        slug
        menuOrder
        excerpt(format: RENDERED)
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        works {
          skill
          slider
        }
        categories {
          nodes {
            id
            name
            slug
          }
        }
      }
    }
  }
`;

const truncateTitle = (title, maxLength = 25) => {
  if (!title) return "";
  const plainText = String(title).replace(/<[^>]*>?/gm, "");
  return plainText.length <= maxLength
    ? plainText
    : plainText.substring(0, maxLength) + "...";
};

const formatSkill = (skillValue) => {
  if (!skillValue) return "";
  return Array.isArray(skillValue)
    ? skillValue.filter((s) => s).join(", ")
    : String(skillValue);
};

const getCategoryName = (work) => {
  if (!work?.categories?.nodes?.length) return "";
  return work.categories.nodes[0].name;
};

function SwiperGallery() {
  const router = useRouter();
  const [isClicked, setIsClicked] = useState(false);
  const [clickedSlug, setClickedSlug] = useState(null);
  const [isInView, setIsInView] = useState(false);
  const [navigationInProgress, setNavigationInProgress] = useState(false); // 遷移中フラグ
  const swiperRef = useRef(null);
  const containerRef = useRef(null);
  const navigationTimeoutRef = useRef(null); // タイムアウト用ref

  // 開発環境でのみログを表示
  const devLog = (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, ...args);
    }
  };

  const handleClick = () => {
    if (isClicked) return;
    setIsClicked(true);
  };

  const handleTransitionEnd = (e) => {
    if (isClicked && e.propertyName === "transform") {
      router.push("/all-works");
    }
  };

  // 🔧 改善されたカードクリックハンドラー
  const handleCardClick = (e, slug) => {
    e.preventDefault();
    
    // 連続クリック・進行中の遷移を防止
    if (clickedSlug || navigationInProgress) {
      devLog("⚠️ Navigation already in progress, ignoring click");
      return;
    }

    devLog("🎯 Card clicked:", slug);
    setClickedSlug(slug);
    setNavigationInProgress(true);

    // 🚀 確実な遷移のための複数の仕組み
    let navigationTriggered = false;

    const navigate = () => {
      if (navigationTriggered) return;
      navigationTriggered = true;
      devLog("🚀 Navigating to:", `/all-works/${slug}`);
      router.push(`/all-works/${slug}`);
    };

    // 1. 元のアニメーション完了を監視（onAnimationEndイベント）
    // 2. フォールバック: 1.5秒後に強制遷移
    navigationTimeoutRef.current = setTimeout(() => {
      devLog("⏰ Timeout fallback triggered for:", slug);
      navigate();
    }, 1500);

    // アニメーション完了時の遷移も保持
    const handleAnimationEnd = () => {
      devLog("✨ Animation completed for:", slug);
      navigate();
    };

    // 次回のレンダリングでアニメーションイベントをセット
    setTimeout(() => {
      const titleElement = document.querySelector(`.${styles.title}.${styles.animate}`);
      if (titleElement) {
        titleElement.addEventListener('animationend', handleAnimationEnd, { once: true });
      }
    }, 0);
  };

  // クリーンアップ関数
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const [isClient, setIsClient] = useState(false);
  const { loading, error, data } = useQuery(GET_WORKS_QUERY, {
    skip: !isClient,
  });

  // DOM準備完了後にIntersection Observerを設定
  useEffect(() => {
    if (!isClient) return;

    let observer;
    let autoplayTimeout;

    // DOM準備を確実に待つ
    const initObserver = () => {
      const container = document.querySelector(`.${styles.worksContents}`);
      devLog("🎯 Looking for container:", !!container);
      
      if (!container) {
        devLog("⏳ Container not found, retrying in 100ms");
        setTimeout(initObserver, 100);
        return;
      }

      devLog("✅ Container found, setting up observer");

      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          devLog("📍 Intersection:", entry.isIntersecting, entry.intersectionRatio);
          
          setIsInView(entry.isIntersecting);
          
          if (entry.isIntersecting && swiperRef.current?.autoplay) {
            devLog("🚀 Starting autoplay...");
            autoplayTimeout = setTimeout(() => {
              if (swiperRef.current?.autoplay) {
                swiperRef.current.autoplay.start();
                devLog("✨ Autoplay started!");
              }
            }, 500);
          } else if (!entry.isIntersecting && swiperRef.current?.autoplay) {
            if (autoplayTimeout) {
              clearTimeout(autoplayTimeout);
            }
            swiperRef.current.autoplay.stop();
            devLog("⏸️ Autoplay stopped");
          }
        },
        {
          threshold: 0.3,
          rootMargin: "-50px 0px"
        }
      );

      observer.observe(container);
      devLog("🎯 Observer attached!");
    };

    // 少し遅延して初期化開始
    setTimeout(initObserver, 500);

    return () => {
      if (autoplayTimeout) clearTimeout(autoplayTimeout);
      if (observer) observer.disconnect();
      devLog("🧹 Observer cleaned up");
    };
  }, [isClient]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 🔧 ローディング状態の改善
  if (!isClient) {
    return (
      <div className={styles.worksContents}>
        <p style={{ textAlign: "center", color: "#fff" }}>Initializing...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.worksContents}>
        <p style={{ textAlign: "center", color: "#fff" }}>Loading gallery...</p>
      </div>
    );
  }

  if (error) {
    console.error("GraphQL Error:", error);
    return (
      <div className={styles.worksContents}>
        <p style={{ textAlign: "center", color: "#fff" }}>
          エラーが発生しました
        </p>
      </div>
    );
  }

  if (!data?.works?.nodes) {
    return (
      <div className={styles.worksContents}>
        <p style={{ textAlign: "center", color: "#fff" }}>
          表示する作品がありません
        </p>
      </div>
    );
  }

  // スライダー表示フラグが true の作品のみをフィルタリング
  const worksToDisplay = data.works.nodes
    .filter((work) => {
      const sliderValue = work.works?.slider;
      return (
        sliderValue === true ||
        sliderValue === "1" ||
        sliderValue === 1 ||
        sliderValue === "true"
      );
    })
    .sort((a, b) => {
      const orderA = a.menuOrder || 0;
      const orderB = b.menuOrder || 0;
      return orderA - orderB;
    })
    .slice(0, 15);

  // 表示する作品がない場合
  if (worksToDisplay.length === 0) {
    return (
      <div className={styles.worksContents}>
        <p style={{ textAlign: "center", color: "#fff" }}>
          スライダーに表示する作品がありません
        </p>
      </div>
    );
  }

  return (
    <div className={styles.worksContents} ref={containerRef}>
      <Swiper
        modules={[Autoplay, Navigation, FreeMode]}
        spaceBetween={26}
        slidesPerView={"auto"}
        loop={worksToDisplay.length > 3}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        navigation={{
          prevEl: `.${styles.swiperButtonPrev}`,
          nextEl: `.${styles.swiperButtonNext}`,
        }}
        breakpoints={{
          0: {
            spaceBetween: 20,
          },
          768: {
            spaceBetween: 24,
          },
        }}
        onSwiper={(swiper) => {
          devLog("🔧 Swiper instance created:", !!swiper);
          swiperRef.current = swiper;
          devLog("🔧 Autoplay available:", !!swiper.autoplay);
          // 初期状態では自動再生を停止
          if (swiper.autoplay) {
            swiper.autoplay.stop();
            devLog("⏹️ Initial autoplay stopped");
          }
        }}
        onSlideChange={(swiper) => {
          devLog("🔄 Active slide index:", swiper.activeIndex);
        }}
      >
        {worksToDisplay.map((work, index) => (
          <SwiperSlide key={work.id}>
            <div
              className={styles["work-imageLink"]}
              role="link"
              tabIndex={0}
              onClick={(e) => handleCardClick(e, work.slug)}
            >
              <article className={styles.workCard}>
                <header className={styles.workHeader}>
                  <span className={styles.workCategory}>
                    {getCategoryName(work)}
                  </span>
                  <Image
                    src={
                      work.featuredImage?.node?.sourceUrl ||
                      "/About/PC/Icon.webp"
                    }
                    alt={work.featuredImage?.node?.altText || "作品画像"}
                    fill
                    style={{ objectFit: "cover" }}
                    priority={index < 3}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </header>
                <footer className={styles.workFooter}>
                  <h3
                    className={`${styles.title} ${
                      clickedSlug === work.slug ? styles.animate : ""
                    }`}
                    onAnimationEnd={() => {
                      if (clickedSlug === work.slug) {
                        router.push(`/all-works/${work.slug}`);
                      }
                    }}
                  >
                    {truncateTitle(work.title)}
                  </h3>
                  <p className={styles.skill}>
                    {formatSkill(work.works?.skill || work.skill || "")}
                  </p>
                  <div className={styles.worksLink}></div>
                </footer>
              </article>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className={styles.navigationContainer}>
        <div className={styles.arrowButtons}>
          <div className={styles.swiperButtonPrev}></div>
          <div className={styles.swiperButtonNext}></div>
        </div>
        <div className={styles.listLink}>
          <button
            className={styles.ListViewButton}
            onClick={handleClick}
            onTransitionEnd={handleTransitionEnd}
          >
            一覧をみる
          </button>
        </div>
      </div>
    </div>
  );
}

export default SwiperGallery;