// app/all-works/WorksClient.jsx
"use client"; // ★★★ クライアントコンポーネントであることを明示 ★★★

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.scss"; // 同じディレクトリのスタイルシートを参照
import { ScrollMotion } from "@/components/animation/Stagger/ScrollMotion"; // ScrollMotionをインポート
import { useRouter } from "next/navigation";

// 開発環境でのみログを表示するヘルパー関数
const devLog = (message, ...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
};

// ヘルパー関数（page.jsx から移動）
const truncateTitle = (title, maxLength = 25) => {
  if (!title) return "";
  const plainText = String(title).replace(/<[^>]*>?/gm, "");
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + "...";
};

const formatSkill = (skillValue) => {
  if (!skillValue) return "";
  if (Array.isArray(skillValue)) {
    return skillValue.filter((s) => s).join(", ");
  }
  return String(skillValue);
};

const getCategoryName = (work) => {
  if (!work || !work.categories || !work.categories.nodes) return "";
  return work.categories.nodes.length > 0 ? work.categories.nodes[0].name : "";
};

const getSkill = (work, structure) => {
  if (!work) return "";

  if (structure === "nested") {
    return work.works?.skill;
  } else if (structure === "direct") {
    return work.skill;
  } else if (structure === "meta") {
    if (work.metaData) {
      const skillMeta = work.metaData.find(
        (meta) => meta.key === "skill" || meta.key === "_skill"
      );
      return skillMeta?.value;
    }
  }

  // フォールバック
  if (work.works && typeof work.works.skill !== "undefined")
    return work.works.skill;
  if (typeof work.skill !== "undefined") return work.skill;
  return "";
};

// ページネーションコンポーネント（page.jsxから移動）
function Pagination({ pagination, basePath = "/all-works" }) {
  const { currentPage, totalPages, hasNextPage, hasPreviousPage } = pagination;

  if (totalPages <= 1) return null;

  const getPageUrl = (pageNum) => {
    if (pageNum === 1) return basePath;
    return `${basePath}/page/${pageNum}`;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <Link key={1} href={getPageUrl(1)} className={styles.pageLink}>
          1
        </Link>
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots1" className={styles.pageDots}>
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Link
          key={i}
          href={getPageUrl(i)}
          className={`${styles.pageLink} ${
            i === currentPage ? styles.currentPage : ""
          }`}
        >
          {i}
        </Link>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="dots2" className={styles.pageDots}>
            ...
          </span>
        );
      }
      pages.push(
        <Link
          key={totalPages}
          href={getPageUrl(totalPages)}
          className={styles.pageLink}
        >
          {totalPages}
        </Link>
      );
    }

    return pages;
  };

  return (
    <nav className={styles.pagination}>
      {hasPreviousPage && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className={`${styles.pageLink} ${styles.prevNext}`}
        >
          <button className={styles.PreviousPageButton}>前のページへ</button>
        </Link>
      )}

      <div className={styles.pageNumbers}>{renderPageNumbers()}</div>

      {hasNextPage && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className={`${styles.pageLink} ${styles.prevNext}`}
        >
          <button className={styles.NextPageButton}>次のページへ</button>
        </Link>
      )}
    </nav>
  );
}

// WorksClient: 作品一覧のメインコンポーネント (クライアントコンポーネント)
export default function WorksClient({ works, skillStructure, pagination }) {
  const router = useRouter();
  const [clickedWorkSlug, setClickedWorkSlug] = useState(null);
  const [navigationInProgress, setNavigationInProgress] = useState(false);
  const navigationTimeoutRef = useRef(null);

  // 🔧 改善されたカードクリックハンドラー
  const handleCardClick = (e, slug) => {
    e.preventDefault();
    
    // 連続クリック・進行中の遷移を防止
    if (clickedWorkSlug || navigationInProgress) {
      devLog("⚠️ Navigation already in progress, ignoring click");
      return;
    }

    devLog("🎯 Work card clicked:", slug);
    setClickedWorkSlug(slug);
    setNavigationInProgress(true);

    const target = e.currentTarget;
    const workLink = target.querySelector(`.${styles["work-link"]}`);

    // 🚀 確実な遷移のための複数の仕組み
    let navigationTriggered = false;

    const navigate = () => {
      if (navigationTriggered) return;
      navigationTriggered = true;
      devLog("🚀 Navigating to:", `/all-works/${slug}`);
      router.push(`/all-works/${slug}`);
    };

    if (workLink) {
      workLink.classList.add(styles.clicked);
      
      // 1. アニメーション完了を監視
      workLink.addEventListener(
        "animationend",
        () => {
          devLog("✨ Work link animation completed for:", slug);
          navigate();
        },
        { once: true }
      );
    }

    // 2. フォールバック: 1.5秒後に強制遷移
    navigationTimeoutRef.current = setTimeout(() => {
      devLog("⏰ Timeout fallback triggered for work:", slug);
      navigate();
    }, 1500);

    // 3. workLinkが見つからない場合の即座のフォールバック
    if (!workLink) {
      devLog("⚠️ WorkLink not found, immediate fallback");
      navigate();
    }
  };

  // クリーンアップ関数
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  // 列数を検出するためのstateとeffect（ブログ記事一覧と同様）
  const [columns, setColumns] = useState(3); // デフォルトはPCの3列

  useEffect(() => {
    const calculateColumns = () => {
      // CSSメディアクエリと連動させるための簡易ロジック
      if (window.innerWidth <= 767) {
        setColumns(1); // モバイル: workCard-gridはflex-direction: column; gap: 30px;
      } else if (window.innerWidth <= 1023) {
        setColumns(2); // タブレット: grid-template-columns: repeat(2, 1fr);
      } else {
        setColumns(3); // PC: grid-template-columns: repeat(3, 1fr);
      }
    };

    calculateColumns(); // 初回計算
    window.addEventListener("resize", calculateColumns);
    return () => window.removeEventListener("resize", calculateColumns);
  }, []);

  // 開発環境での並び順確認ログ
  useEffect(() => {
    devLog("🎨 WorksClient received works (first 5):");
    works.slice(0, 5).forEach((work, index) => {
      devLog(`${index + 1}. ${work.title} (menuOrder: ${work.menuOrder || 0})`);
    });
  }, [works]);

  return (
    <main className={styles["works-container"]}>
      <div className={styles.works_headTitle}>
        <span className={styles.works_subText}>作品</span>
        <h1 className={styles.works_h1Title}>ALL Works</h1>
      </div>

      {pagination.totalWorks > 0 && (
        <div className={styles.works_postInfo}>
          <span className={styles.works_postCount}>
            {pagination.totalWorks}件中 {pagination.startIndex}-
            {pagination.endIndex}件を表示
          </span>
        </div>
      )}

      <span className={styles["works_separatorLine"]}></span>

      <div className={styles["workCard-grid"]}>
        {works.map((work, index) => {
          // 各作品カードのアニメーション遅延を計算
          const row = Math.floor(index / columns);
          const col = index % columns;
          const initialDelay = 0.1; // 最初のカードの開始遅延
          const rowDelay = 0.2; // 行ごとの追加遅延
          const columnDelay = 0.05; // 列ごとの追加遅延

          // モバイル（1列）の場合は列の遅延を無効にするか、rowDelayに含める
          const currentColumnDelay = columns === 1 ? 0 : columnDelay;
          const currentRowDelay = columns === 1 ? 0.1 : rowDelay; // モバイルでは行ごとにシンプルに遅延

          const calculatedDelay =
            initialDelay + row * currentRowDelay + col * currentColumnDelay;

          return (
            <ScrollMotion
              key={work.id} // keyはScrollMotionに付与
              threshold={0.1} // スクロールで早く発動
              once={true} // 一度表示されたら再アニメーションしない
              delay={calculatedDelay} // 計算した遅延を渡す
              duration={0.6}
              yOffset={50} // 下から上へのアニメーション
              xOffset={0}
            >
              <div
                className={styles["work-imageLink"]}
                onClick={(e) => handleCardClick(e, work.slug)}
                role="link"
                tabIndex={0}
              >
                <article className={styles["work-card"]}>
                  <header className={styles["work-header"]}>
                    {getCategoryName(work) && (
                      <span className={styles["work-category"]}>
                        {getCategoryName(work)}
                      </span>
                    )}

                    <Image
                      src={
                        work.featuredImage?.node?.sourceUrl ||
                        "/About/PC/Icon.webp"
                      }
                      width={353}
                      height={200}
                      alt={
                        work.featuredImage?.node?.altText ||
                        truncateTitle(work.title) ||
                        "作品画像"
                      }
                      className={styles["work-image"]}
                      priority={index < 4}
                    />
                  </header>
                  <footer className={styles["work-footer"]}>
                    <h2 className={styles["work-title"]}>
                      {truncateTitle(work.title)}
                    </h2>
                    <p className={styles["work-skill"]}>
                      {formatSkill(getSkill(work, skillStructure))}
                    </p>
                    <div className={styles["work-link"]}></div>
                  </footer>
                </article>
              </div>
            </ScrollMotion>
          );
        })}
      </div>

      <Pagination pagination={pagination} />
    </main>
  );
}