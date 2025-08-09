// app/all-works/page.jsx

import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import ResponsiveHeaderWrapper from "@/components/ResponsiveHeaderWrapper";
import Breadcrumb from "@/components/Breadcrumb/index";
import styles from "./page.module.scss"; // スタイルは引き続き参照

// 新しく作成するクライアントコンポーネントをインポート
import WorksClient from "./WorksClient";
import Link from "next/link";

// ページネーションの設定
const WORKS_PER_PAGE = 9;
const MAX_WORKS_TO_FETCH = 1000;

const breadcrumbItems = [
  { name: "ホーム", path: "/" },
  { name: "全作品一覧", path: "/all-works" },
];

// GraphQLクライアントの初期化
const client = new ApolloClient({
  uri:
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
    "https://your-wordpress-site.com/graphql",
  cache: new InMemoryCache(),
});

// 作品を取得するクエリ群（menuOrderでソート、menuOrderフィールドを追加）
const GET_WORKS_TEST_NESTED = gql`
  query GetWorksTestNested($first: Int!, $after: String) {
    works(
      first: $first
      after: $after
      where: { orderby: { field: MENU_ORDER, order: ASC } }
    ) {
      nodes {
        id
        title
        slug
        menuOrder
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
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const GET_WORKS_TEST_DIRECT = gql`
  query GetWorksTestDirect($first: Int!, $after: String) {
    works(
      first: $first
      after: $after
      where: { orderby: { field: MENU_ORDER, order: ASC } }
    ) {
      nodes {
        id
        title
        slug
        menuOrder
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
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const GET_WORKS_TEST_META = gql`
  query GetWorksTestMeta($first: Int!, $after: String) {
    works(
      first: $first
      after: $after
      where: { orderby: { field: MENU_ORDER, order: ASC } }
    ) {
      nodes {
        id
        title
        slug
        menuOrder
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
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// 開発環境でのみログを表示するヘルパー関数
function devLog(message, ...args) {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
}

// menuOrderでソートするヘルパー関数
function sortWorksByMenuOrder(works) {
  if (!works || !Array.isArray(works)) return [];
  
  // スプレッド演算子で新しい配列を作成
  return [...works].sort((a, b) => {
    const orderA = a.menuOrder || 0;
    const orderB = b.menuOrder || 0;
    return orderA - orderB;
  });
}

// スキル構造を判断する関数
async function determineSkillStructure() {
  try {
    // まずnested構造をテスト
    try {
      const { data } = await client.query({
        query: GET_WORKS_TEST_NESTED,
        variables: { first: 1, after: null },
      });

      if (
        data?.works?.nodes?.[0]?.works &&
        typeof data.works.nodes[0].works.skill !== "undefined"
      ) {
        devLog("Skill structure: nested");
        return { structure: "nested", query: GET_WORKS_TEST_NESTED };
      }
    } catch (error) {
      devLog("Nested skill test failed:", error.message);
    }

    // 次にdirect構造をテスト
    try {
      const { data } = await client.query({
        query: GET_WORKS_TEST_DIRECT,
        variables: { first: 1, after: null },
      });

      if (
        data?.works?.nodes?.[0] &&
        typeof data.works.nodes[0].skill !== "undefined"
      ) {
        devLog("Skill structure: direct");
        return { structure: "direct", query: GET_WORKS_TEST_DIRECT };
      }
    } catch (error) {
      devLog("Direct skill test failed:", error.message);
    }

    // 最後にmeta構造をテスト
    try {
      const { data } = await client.query({
        query: GET_WORKS_TEST_META,
        variables: { first: 1, after: null },
      });

      if (data?.works?.nodes?.[0]?.metaData) {
        const skillMeta = data.works.nodes[0].metaData.find(
          (meta) => meta.key === "skill" || meta.key === "_skill"
        );
        if (skillMeta) {
          devLog("Skill structure: meta");
          return { structure: "meta", query: GET_WORKS_TEST_META };
        }
      }
    } catch (error) {
      devLog("Meta skill test failed:", error.message);
    }

    // フォールバック
    devLog("Skill structure: fallback to nested");
    return { structure: "nested", query: GET_WORKS_TEST_NESTED };
  } catch (error) {
    console.error("Error determining skill structure:", error);
    return { structure: "nested", query: GET_WORKS_TEST_NESTED };
  }
}

// 全作品を再帰的に取得する関数（ソート機能付き）
async function fetchAllWorks(skillStructure, after = null, allWorks = []) {
  try {
    const { data } = await client.query({
      query: skillStructure.query,
      variables: {
        first: 100,
        after: after,
      },
    });

    const works = data?.works?.nodes || [];
    const newAllWorks = [...allWorks, ...works];

    if (newAllWorks.length >= MAX_WORKS_TO_FETCH) {
      const limitedWorks = newAllWorks.slice(0, MAX_WORKS_TO_FETCH);
      // menuOrderでソート（0からの整数、小さい値が先頭）
      return sortWorksByMenuOrder(limitedWorks);
    }

    if (
      data?.works?.pageInfo?.hasNextPage &&
      data?.works?.pageInfo?.endCursor
    ) {
      return await fetchAllWorks(
        skillStructure,
        data.works.pageInfo.endCursor,
        newAllWorks
      );
    }

    // 最終的にmenuOrderでソート
    return sortWorksByMenuOrder(newAllWorks);
  } catch (error) {
    console.error("Error fetching works:", error);
    return sortWorksByMenuOrder(allWorks);
  }
}

// ページネーション情報と共に作品を返す
async function getAllWorksWithPagination(requestedPage = 1) {
  try {
    const skillStructure = await determineSkillStructure();
    const allWorks = await fetchAllWorks(skillStructure);
    
    // 開発環境でのソート確認
    devLog("📊 Works order check (first 10):");
    allWorks.slice(0, 10).forEach((work, index) => {
      devLog(`${index + 1}. ${work.title} (menuOrder: ${work.menuOrder || 0})`);
    });
    
    const totalWorks = allWorks.length;
    const totalPages = Math.ceil(totalWorks / WORKS_PER_PAGE);

    const currentPage = Math.max(1, Math.min(requestedPage, totalPages || 1));

    const startIndex = (currentPage - 1) * WORKS_PER_PAGE;
    const endIndex = startIndex + WORKS_PER_PAGE;
    const currentPageWorks = allWorks.slice(startIndex, endIndex);

    return {
      works: currentPageWorks,
      skillStructure: skillStructure.structure,
      pagination: {
        currentPage,
        totalWorks,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        startIndex: totalWorks > 0 ? startIndex + 1 : 0,
        endIndex: Math.min(endIndex, totalWorks),
      },
      error: null,
    };
  } catch (error) {
    console.error("Error in getAllWorksWithPagination:", error);
    return {
      works: [],
      skillStructure: "nested",
      pagination: {
        currentPage: 1,
        totalWorks: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        startIndex: 0,
        endIndex: 0,
      },
      error: error.message,
    };
  }
}

// メタデータを設定
export const metadata = {
  title: "作品一覧",
  description: "作品の一覧ページです",
  robots: {
    index: true,
    follow: true,
  },
};

// SSGでビルド時に静的に生成
export const dynamic = 'force-static';
export const revalidate = 86400;

// メインコンポーネント（WorksPage - サーバーコンポーネント）
export default async function WorksPage() {
  const page = 1; // 1ページ目固定

  devLog(`Rendering works page: ${page} (first page)`);

  const { works, skillStructure, pagination, error } =
    await getAllWorksWithPagination(page);

  // エラーハンドリング
  if (error) {
    return (
      <div className={styles.allWorks}>
        <ResponsiveHeaderWrapper className={styles.worksHeader} />
        <div className={styles.breadcrumbWrapper}>
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <main className={styles["works-container"]}>
          <div className={styles.error}>
            <h2>エラーが発生しました</h2>
            <p>作品の読み込み中にエラーが発生しました。</p>
            <details className={styles.errorDetails}>
              <summary>エラーの詳細</summary>
              <p>{error}</p>
            </details>
          </div>
        </main>
      </div>
    );
  }

  // 作品が見つからない場合もサーバーでハンドリング
  if (works.length === 0) {
    return (
      <div className={styles.allWorks}>
        <ResponsiveHeaderWrapper className={styles.worksHeader} />
        <div className={styles.breadcrumbWrapper}>
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <main className={styles["works-container"]}>
          <div className={styles.noResults}>
            <h2>作品が見つかりません</h2>
            <p>まだ作品が投稿されていないか、一時的に利用できません。</p>
            <Link href="/" className={styles.homeLink}>
              ホームページに戻る
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // データが正常に取得できたら、WorksClientにpropsとして渡す
  return (
    <>
     <div className={styles.allWorks}>
      <ResponsiveHeaderWrapper className={styles.worksHeader} />
      <div className={styles.breadcrumbWrapper}>
        <Breadcrumb items={breadcrumbItems} />
      </div>
      {/* 作品データとページネーション情報をクライアントコンポーネントに渡す */}
      <WorksClient
        works={works}
        skillStructure={skillStructure}
        pagination={pagination}
      />
      </div>
    </>
  );
}