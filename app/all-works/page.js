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

// 作品を取得するクエリ群 (変更なし)
const GET_WORKS_TEST_NESTED = gql`
  query GetWorksTestNested($first: Int!, $after: String) {
    works(
      first: $first
      after: $after
      where: { orderby: { field: DATE, order: DESC } }
    ) {
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
      where: { orderby: { field: DATE, order: DESC } }
    ) {
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
      where: { orderby: { field: DATE, order: DESC } }
    ) {
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
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// スキル構造を判断する関数 (変更なし)
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
        console.log("Skill structure: nested");
        return { structure: "nested", query: GET_WORKS_TEST_NESTED };
      }
    } catch (error) {
      console.log("Nested skill test failed:", error.message);
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
        console.log("Skill structure: direct");
        return { structure: "direct", query: GET_WORKS_TEST_DIRECT };
      }
    } catch (error) {
      console.log("Direct skill test failed:", error.message);
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
          console.log("Skill structure: meta");
          return { structure: "meta", query: GET_WORKS_TEST_META };
        }
      }
    } catch (error) {
      console.log("Meta skill test failed:", error.message);
    }

    // フォールバック
    console.log("Skill structure: fallback to nested");
    return { structure: "nested", query: GET_WORKS_TEST_NESTED };
  } catch (error) {
    console.error("Error determining skill structure:", error);
    return { structure: "nested", query: GET_WORKS_TEST_NESTED };
  }
}

// ヘルパー関数 (WorksClient.jsx に移動するため、ここでは削除)
// const truncateTitle = (title, maxLength = 25) => { /* ... */ };
// const formatSkill = (skillValue) => { /* ... */ };
// const getCategoryName = (work) => { /* ... */ };
// const getSkill = (work, structure) => { /* ... */ };

// 全作品を再帰的に取得する関数 (変更なし)
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
      return newAllWorks.slice(0, MAX_WORKS_TO_FETCH);
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

    return newAllWorks;
  } catch (error) {
    console.error("Error fetching works:", error);
    return allWorks;
  }
}

// ページネーション情報と共に作品を返す (変更なし)
async function getAllWorksWithPagination(requestedPage = 1) {
  try {
    const skillStructure = await determineSkillStructure();
    const allWorks = await fetchAllWorks(skillStructure);
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

// メタデータを設定 (変更なし)
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


// ページネーションコンポーネント (WorksClient.jsx に移動するため、ここでは削除)
// function Pagination({ pagination, basePath = "/all-works" }) { /* ... */ }

// メインコンポーネント（WorksPage - サーバーコンポーネント）
export default async function WorksPage() {
  const page = 1; // 1ページ目固定

  console.log(`Rendering works page: ${page} (first page)`);

  const { works, skillStructure, pagination, error } =
    await getAllWorksWithPagination(page);

  // エラーハンドリング (WorksClient.jsx にも同様のロジックが必要になる場合がある)
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
        <Cta />
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
        <Cta />
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