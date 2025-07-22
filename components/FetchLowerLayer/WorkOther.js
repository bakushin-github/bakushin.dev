// components/FetchLowerLayer/WorkOther.jsx
'use client'; // Next.js のクライアントコンポーネント宣言

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, gql } from "@apollo/client"; // useQuery と gql をインポート
import styles from "./workOther.module.scss"; // CSSモジュールをインポート
import { ScrollMotion } from "@/components/animation/Stagger/ScrollMotion"; // ScrollMotionをインポート
import { useRouter } from "next/navigation";

console.log("WorkOther.js module loaded");

// --- テストクエリ ---
// WPGraphQL のカスタム投稿タイプ 'works' の構造を動的に判断するためのテストクエリです。
// スキルデータが 'works' フィールド内にネストされているかを確認します。
const TEST_NESTED_SKILL = gql`
  query TestNestedSkill {
    works(first: 1) {
      nodes {
        id
        title
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
    works(first: 1) {
      nodes {
        id
        title
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
    works(first: 1) {
      nodes {
        id
        title
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

// --- 最終的に使用する作品データ取得クエリ ---
const GET_WORKS_WITH_NESTED_SKILL = gql`
  query GetWorksWithNestedSkill($currentWorkId: [ID]) {
    works(first: 6, where: { notIn: $currentWorkId }) {
      nodes {
        id
        title
        slug
        excerpt(format: RENDERED)
        featuredImage {
          node {
            sourceUrl(size: MEDIUM)
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
    works(first: 6, where: { notIn: $currentWorkId }) {
      nodes {
        id
        title
        slug
        excerpt(format: RENDERED)
        featuredImage {
          node {
            sourceUrl(size: MEDIUM)
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
    works(first: 6, where: { notIn: $currentWorkId }) {
      nodes {
        id
        title
        slug
        excerpt(format: RENDERED)
        featuredImage {
          node {
            sourceUrl(size: MEDIUM)
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
const router = useRouter();

const handleCardClick = (e, slug) => {
  e.preventDefault();
  if (clickedSlug) return;
  setClickedSlug(slug);

  const workLink = e.currentTarget.querySelector(`.${styles.worksLink}`);
  if (workLink) {
    workLink.classList.add(styles.clicked); // `.worksLink.clicked::before` にアニメーションが定義されている前提
    workLink.addEventListener(
      "animationend",
      () => {
        router.push(`/all-works/${slug}`);
      },
      { once: true }
    );
  } else {
    router.push(`/all-works/${slug}`);
  }
};
  console.log("WorkOthers component rendering with currentWorkId:", currentWorkId);

  const [isClient, setIsClient] = useState(false);
  const [accessMethod, setAccessMethod] = useState(null);
  const [finalQuery, setFinalQuery] = useState(null);
  const [columns, setColumns] = useState(3); // ★★★ columns はここで定義済み ★★★

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
    onCompleted: (data) => console.log("Nested test query completed:", data),
    onError: (error) => console.log("Nested skill access test error:", error.message),
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
    onCompleted: (data) => console.log("Direct test query completed:", data),
    onError: (error) => console.log("Direct skill access test error:", error.message),
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
    onCompleted: (data) => console.log("Meta test query completed:", data),
    onError: (error) => console.log("Meta data access test error:", error.message),
  });

  // クライアント側でのマウントをマーク
  useEffect(() => {
    console.log("Initial useEffect running - setting isClient to true");
    setIsClient(true);
    return () => {
      console.log("Cleanup function called");
    };
  }, []);

  // isClient 変更時のログ
  useEffect(() => {
    console.log("isClient changed to:", isClient);
    if (isClient) {
      setTimeout(() => {
        console.log("Delayed check after isClient changed:", {
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
    console.log("Query decision useEffect running with:", {
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
      console.log("Skipping query decision due to loading state");
      return;
    }

    if (
      nestedTestData?.works?.nodes?.[0]?.works &&
      typeof nestedTestData.works.nodes[0].works.skill !== "undefined"
    ) {
      console.log("Access method: nested");
      setAccessMethod("nested");
      setFinalQuery(GET_WORKS_WITH_NESTED_SKILL);
    }
    else if (
      directTestData?.works?.nodes?.[0] &&
      typeof directTestData.works.nodes[0].skill !== "undefined"
    ) {
      console.log("Access method: direct");
      setAccessMethod("direct");
      setFinalQuery(GET_WORKS_WITH_DIRECT_SKILL);
    }
    else if (metaTestData?.works?.nodes?.[0]?.metaData) {
      const skillMeta = metaTestData.works.nodes[0].metaData.find(
        (meta) => meta.key === "skill" || meta.key === "_skill"
      );
      if (skillMeta) {
        console.log("Access method: meta");
        setAccessMethod("meta");
        setFinalQuery(GET_WORKS_WITH_METADATA);
      } else {
        console.log("Access method: unknown (skill not found in metaData)");
        setAccessMethod("unknown");
        setFinalQuery(DEFAULT_FALLBACK_QUERY);
      }
    }
    else {
      console.log(
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
        currentWorkId: currentWorkId ? [currentWorkId] : [], // IDを配列として渡し、なければ空の配列
      },
      skip: !isClient || !finalQuery,
      fetchPolicy: "cache-first",
      nextFetchPolicy: "cache-only",
      onCompleted: (data) => console.log("Main query completed:", data),
      onError: (err) => console.log("Main query error:", err.message)
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
    console.log("Rendering loading state because isClient is false");
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
    console.log("Rendering loading state because queries are still loading", {
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
    console.log("Rendering error state:", error.message);
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

  const worksToDisplay = data?.works?.nodes || [];
  if (worksToDisplay.length === 0) {
    console.log("Rendering empty state, no works found");
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

  console.log("Rendering works data:", worksToDisplay.length, "items found");
  return (
    <div className={styles.worksContents}>
      {worksToDisplay.map((work, index) => {
        console.log(`Rendering work item ${index}:`, work.title);

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

console.log("About to export WorkOthers component");
export default WorkOthers;