// components/FetchLowerLayer/WorkOther.jsx
'use client'; // Next.js のクライアントコンポーネント宣言

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, gql } from "@apollo/client"; // useQuery と gql をインポート
import styles from "./workOther.module.scss"; // CSSモジュールをインポート
import { ScrollMotion } from "@/components/animation/Stagger/ScrollMotion"; // ScrollMotionをインポート
import { useRouter } from "next/navigation";

console.log("WorkOther.js module loaded");

// 開発環境でのみログを表示するヘルパー関数
const devLog = (message, ...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
};

// menuOrderでソートするヘルパー関数
const sortWorksByMenuOrder = (works) => {
  return works.sort((a, b) => {
    const orderA = a.menuOrder || 0;
    const orderB = b.menuOrder || 0;
    return orderA - orderB;
  });
};

// --- テストクエリ（menuOrderでソート、menuOrderフィールド追加） ---
// WPGraphQL のカスタム投稿タイプ 'works' の構造を動的に判断するためのテストクエリです。
// スキルデータが 'works' フィールド内にネストされているかを確認します。
const TEST_NESTED_SKILL = gql`
  query TestNestedSkill {
    works(first: 1, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        id
        title
        menuOrder
        works { # カスタムフィールドグループ 'works' が存在し、その中に 'skill' があるか
          skill
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

// スキルデータが 'works' ノードの直下にあるかを確認します。
const TEST_DIRECT_SKILL = gql`
  query TestDirectSkill {
    works(first: 1, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        id
        title
        menuOrder
        skill # 'skill' フィールドが直下にあるか
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

// スキルデータが汎用的な 'metaData' フィールドとして格納されているかを確認します。
const TEST_META_DATA = gql`
  query TestMetaData {
    works(first: 1, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
      nodes {
        id
        title
        menuOrder
        metaData { # ACF などで追加されたカスタムフィールドが metaData に格納されているか
          key
          value
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

// --- 最終的に使用する作品データ取得クエリ（menuOrderでソート、menuOrderフィールド追加、現在の作品を除外） ---
const GET_WORKS_WITH_NESTED_SKILL = gql`
  query GetWorksWithNestedSkill($currentWorkId: [ID]) {
    works(first: 6, where: { notIn: $currentWorkId, orderby: { field: MENU_ORDER, order: ASC } }) {
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

const GET_WORKS_WITH_DIRECT_SKILL = gql`
  query GetWorksWithDirectSkill($currentWorkId: [ID]) {
    works(first: 6, where: { notIn: $currentWorkId, orderby: { field: MENU_ORDER, order: ASC } }) {
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
        skill
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

const GET_WORKS_WITH_METADATA = gql`
  query GetWorksWithMetaData($currentWorkId: [ID]) {
    works(first: 6, where: { notIn: $currentWorkId, orderby: { field: MENU_ORDER, order: ASC } }) {
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
        metaData {
          key
          value
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

const DEFAULT_FALLBACK_QUERY = GET_WORKS_WITH_NESTED_SKILL;

// --- ヘルパー関数 ---
const truncateTitle = (title, maxLength = 25) => {
  if (!title) return "";
  const plainText = String(title).replace(/<[^>]*>?/gm, "");
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + "...";
};

const truncateExcerpt = (excerpt, maxLength = 30) => {
  if (!excerpt) return "";
  const plainText = String(excerpt).replace(/<[^>]*>?/gm, "");
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

// --- WorkOthers コンポーネント ---
function WorkOthers({ currentWorkId }) {
  const [clickedSlug, setClickedSlug] = useState(null);
  const [navigationInProgress, setNavigationInProgress] = useState(false);
  const navigationTimeoutRef = useRef(null);
  const router = useRouter();

  // 🔧 改善されたカードクリックハンドラー
  const handleCardClick = (e, slug) => {
    e.preventDefault();
    
    // 連続クリック・進行中の遷移を防止
    if (clickedSlug || navigationInProgress) {
      devLog("⚠️ Navigation already in progress, ignoring click");
      return;
    }

    devLog("🎯 WorkOther card clicked:", slug);
    setClickedSlug(slug);
    setNavigationInProgress(true);

    const workLink = e.currentTarget.querySelector(`.${styles.worksLink}`);

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
          devLog("✨ WorkOther link animation completed for:", slug);
          navigate();
        },
        { once: true }
      );
    }

    // 2. フォールバック: 1.5秒後に強制遷移
    navigationTimeoutRef.current = setTimeout(() => {
      devLog("⏰ Timeout fallback triggered for WorkOther:", slug);
      navigate();
    }, 1500);

    // 3. workLinkが見つからない場合の即座のフォールバック
    if (!workLink) {
      devLog("⚠️ WorkOther worksLink not found, immediate fallback");
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

  devLog("WorkOthers component rendering with currentWorkId:", currentWorkId);

  const [isClient, setIsClient] = useState(false);
  const [accessMethod, setAccessMethod] = useState(null);
  const [finalQuery, setFinalQuery] = useState(null);
  const [columns, setColumns] = useState(3);

  // 列数を検出するためのeffect
  useEffect(() => {
    const calculateColumns = () => {
      // styles.worksContentsのメディアクエリに合わせる
      if (window.innerWidth <= 767) {
        setColumns(1); // @media (max-width: 767px) { display: block; }
      } else if (window.innerWidth <= 1023) {
        setColumns(2); // @media (max-width: 1023px) { grid-template-columns: repeat(2, 1fr); }
      } else {
        setColumns(3); // デフォルト (grid-template-columns: repeat(3, 1fr); )
      }
    };

    calculateColumns(); // 初回計算
    window.addEventListener('resize', calculateColumns);
    return () => window.removeEventListener('resize', calculateColumns);
  }, []); // 空の依存配列でマウント時のみ実行

  // --- テストクエリの実行 ---
  const {
    data: nestedTestData,
    error: nestedTestError,
    loading: nestedTestLoading,
  } = useQuery(TEST_NESTED_SKILL, {
    skip: !isClient,
    onCompleted: (data) => devLog("Nested test query completed:", data),
    onError: (error) => devLog("Nested skill access test error:", error.message),
  });

  const {
    data: directTestData,
    error: directTestError,
    loading: directTestLoading,
  } = useQuery(TEST_DIRECT_SKILL, {
    skip:
      !isClient ||
      nestedTestLoading ||
      !!(
        nestedTestData?.works?.nodes?.[0]?.works &&
        typeof nestedTestData.works.nodes[0].works.skill !== "undefined"
      ),
    onCompleted: (data) => devLog("Direct test query completed:", data),
    onError: (error) => devLog("Direct skill access test error:", error.message),
  });

  const {
    data: metaTestData,
    error: metaTestError,
    loading: metaTestLoading,
  } = useQuery(TEST_META_DATA, {
    skip:
      !isClient ||
      nestedTestLoading ||
      directTestLoading ||
      !!(
        nestedTestData?.works?.nodes?.[0]?.works &&
        typeof nestedTestData.works.nodes[0].works.skill !== "undefined"
      ) ||
      !!(
        directTestData?.works?.nodes?.[0] &&
        typeof directTestData.works.nodes[0].skill !== "undefined"
      ),
    onCompleted: (data) => devLog("Meta test query completed:", data),
    onError: (error) => devLog("Meta data access test error:", error.message),
  });

  // クライアント側でのマウントをマーク
  useEffect(() => {
    devLog("Initial useEffect running - setting isClient to true");
    setIsClient(true);
    return () => {
      devLog("Cleanup function called");
    };
  }, []);

  // isClient 変更時のログ
  useEffect(() => {
    devLog("isClient changed to:", isClient);
    if (isClient) {
      setTimeout(() => {
        devLog("Delayed check after isClient changed:", {
          isClient,
          nestedTestLoading,
          directTestLoading,
          metaTestLoading
        });
      }, 500);
    }
  }, [isClient, nestedTestLoading, directTestLoading, metaTestLoading]);

  // テストクエリの結果に基づいて最終クエリを決定
  useEffect(() => {
    devLog("Query decision useEffect running with:", {
      isClient,
      nestedTestLoading,
      directTestLoading,
      metaTestLoading,
      nestedTestData: nestedTestData ? "exists" : "null",
      directTestData: directTestData ? "exists" : "null",
      metaTestData: metaTestData ? "exists" : "null"
    });

    if (
      !isClient ||
      nestedTestLoading ||
      directTestLoading ||
      metaTestLoading
    ) {
      devLog("Skipping query decision due to loading state");
      return;
    }

    if (
      nestedTestData?.works?.nodes?.[0]?.works &&
      typeof nestedTestData.works.nodes[0].works.skill !== "undefined"
    ) {
      devLog("Access method: nested");
      setAccessMethod("nested");
      setFinalQuery(GET_WORKS_WITH_NESTED_SKILL);
    }
    else if (
      directTestData?.works?.nodes?.[0] &&
      typeof directTestData.works.nodes[0].skill !== "undefined"
    ) {
      devLog("Access method: direct");
      setAccessMethod("direct");
      setFinalQuery(GET_WORKS_WITH_DIRECT_SKILL);
    }
    else if (metaTestData?.works?.nodes?.[0]?.metaData) {
      const skillMeta = metaTestData.works.nodes[0].metaData.find(
        (meta) => meta.key === "skill" || meta.key === "_skill"
      );
      if (skillMeta) {
        devLog("Access method: meta");
        setAccessMethod("meta");
        setFinalQuery(GET_WORKS_WITH_METADATA);
      } else {
        devLog("Access method: unknown (skill not found in metaData)");
        setAccessMethod("unknown");
        setFinalQuery(DEFAULT_FALLBACK_QUERY);
      }
    }
    else {
      devLog(
        "Access method: unknown (skill not found in any tested structure)"
      );
      setAccessMethod("unknown");
      setFinalQuery(DEFAULT_FALLBACK_QUERY);
    }
  }, [
    isClient,
    nestedTestData,
    nestedTestError,
    nestedTestLoading,
    directTestData,
    directTestError,
    directTestLoading,
    metaTestData,
    metaTestError,
    metaTestLoading,
  ]);

  // 最終的に決定されたクエリで作品データを取得
  const { loading, error, data } = useQuery(
    finalQuery || DEFAULT_FALLBACK_QUERY,
    {
      variables: {
        currentWorkId: currentWorkId ? [currentWorkId] : [], // 現在の作品IDを配列として渡し、なければ空の配列
      },
      skip: !isClient || !finalQuery,
      fetchPolicy: "cache-first",
      nextFetchPolicy: "cache-only",
      onCompleted: (data) => {
        devLog("Main query completed:", data);
        // 取得した作品の並び順を確認
        if (data?.works?.nodes) {
          devLog("📊 WorkOthers - retrieved works order (first 6):");
          data.works.nodes.forEach((work, index) => {
            devLog(`${index + 1}. ${work.title} (menuOrder: ${work.menuOrder || 0})`);
          });
          
          // 現在の作品が除外されているか確認
          if (currentWorkId) {
            const currentWorkInResults = data.works.nodes.find(work => work.id === currentWorkId);
            if (currentWorkInResults) {
              devLog("⚠️ Warning: Current work found in results, should be excluded:", currentWorkInResults.title);
            } else {
              devLog("✅ Current work correctly excluded from results");
            }
          }
        }
      },
      onError: (err) => devLog("Main query error:", err.message)
    }
  );

  // 決定されたアクセス方法に基づいてスキル値を取得するヘルパー関数
  const getSkill = (work) => {
    if (!work) return "";
    if (accessMethod === "nested") {
      return work.works?.skill;
    } else if (accessMethod === "direct") {
      return work.skill;
    } else if (accessMethod === "meta") {
      if (work.metaData) {
        const skillMeta = work.metaData.find(
          (meta) => meta.key === "skill" || meta.key === "_skill"
        );
        return skillMeta?.value;
      }
    }
    // フォールバックロジック
    if (work.works && typeof work.works.skill !== "undefined")
      return work.works.skill;
    if (typeof work.skill !== "undefined") return work.skill;
    return "";
  };

  // --- レンダリングロジック ---
  if (!isClient) {
    devLog("Rendering loading state because isClient is false");
    return (
      <div
        className={styles.worksContents}
        style={{
          border: '1px solid #ccc',
          padding: '20px',
          margin: '20px',
          background: '#f9f9f9'
        }}
      >
        <div
          style={{
            height: "250px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: '#333' }}>
            ギャラリーを読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (
    loading ||
    (!finalQuery && (nestedTestLoading || directTestLoading || metaTestLoading))
  ) {
    devLog("Rendering loading state because queries are still loading", {
      loading,
      finalQuery: finalQuery ? "set" : "not set",
      nestedTestLoading,
      directTestLoading,
      metaTestLoading
    });
    return (
      <div
        className={styles.worksContents}
        style={{
          border: '1px solid #ddd',
          padding: '20px',
          margin: '20px',
          background: '#f0f0f0'
        }}
      >
        <div
          style={{
            height: "250px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: '#333' }}>
            作品データを読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (error && !data?.works?.nodes) {
    devLog("Rendering error state:", error.message);
    return (
      <div
        className={styles.worksContents}
        style={{
          border: '1px solid #f88',
          padding: '20px',
          margin: '20px',
          background: '#fff0f0'
        }}
      >
        <p style={{ color: '#c00' }}>エラーが発生しました: {error.message}</p>
      </div>
    );
  }

  let worksToDisplay = data?.works?.nodes || [];
  
  // クライアントサイドでもソートを確実に実行（GraphQLのソートが効かない場合のフォールバック）
  // worksToDisplay = sortWorksByMenuOrder(worksToDisplay);
  
  if (worksToDisplay.length === 0) {
    devLog("Rendering empty state, no works found");
    return (
      <div
        className={styles.worksContents}
        style={{
          border: '1px solid #ddd',
          padding: '20px',
          margin: '20px',
          background: '#fffbf0'
        }}
      >
        <p style={{ color: '#333' }}>表示する作品が見つかりません。</p>
      </div>
    );
  }

  devLog("Rendering works data:", worksToDisplay.length, "items found");
  return (
    <div className={styles.worksContents}>
      {worksToDisplay.map((work, index) => {
        devLog(`Rendering work item ${index}:`, work.title, "(menuOrder:", work.menuOrder || 0, ")");

        // 各作品カードのアニメーション遅延を計算
        const row = Math.floor(index / columns);
        const col = index % columns;
        const initialDelay = 0.05; // 最初のカードの開始遅延（WorkOthersは画面下部に表示されるため、少し早めに）
        const rowDelay = 0.1; // 行ごとの追加遅延
        const columnDelay = 0.03; // 列ごとの追加遅延

        // モバイル（1列）の場合は列の遅延を無効にするか、rowDelayに含める
        const currentColumnDelay = columns === 1 ? 0 : columnDelay;
        const currentRowDelay = columns === 1 ? 0.07 : rowDelay; // モバイルでは行ごとにシンプルに遅延を調整

        const calculatedDelay = initialDelay + (row * currentRowDelay) + (col * currentColumnDelay);

        return (
          <ScrollMotion
            key={work.id || index} // keyはScrollMotionに付与
            threshold={0.1} // スクロールで早く発動
            once={true} // 一度表示されたら再アニメーションしない
            delay={calculatedDelay} // 計算した遅延を渡す
            duration={0.6}
            yOffset={50} // 下から上へのアニメーション
            xOffset={0}
          >
           <div
  className={styles["work-imageLink"]}
  role="link"
  tabIndex={0}
  onClick={(e) => handleCardClick(e, work.slug)}
  aria-label={`${truncateTitle(work.title)}の詳細へ`}
>
  <article className={styles.workCard}>
    <header className={styles.workHeader}>
      <span className={styles.workCategory}>{getCategoryName(work)}</span>
      <Image
        src={work.featuredImage?.node?.sourceUrl || "/About/PC/Icon.webp"}
        width={300}
        height={200}
        alt={
          work.featuredImage?.node?.altText ||
          truncateTitle(work.title) ||
          "作品画像"
        }
        className={styles.thumbnailImage}
      />
    </header>
    <footer className={styles.workFooter}>
      <h3 className={styles.title}>{truncateTitle(work.title)}</h3>
      <p className={styles.skill}>{formatSkill(getSkill(work))}</p>
      <div className={`${styles.worksLink} ${clickedSlug === work.slug ? styles.clicked : ""}`}></div>
    </footer>
  </article>
</div>

          </ScrollMotion>
        );
      })}
    </div>
  );
}

devLog("About to export WorkOthers component");
export default WorkOthers;