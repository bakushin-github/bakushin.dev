import Image from "next/image";
import Link from "next/link";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import styles from "../../page.module.scss";
import ResponsiveHeaderWrapper from "@/components/ResponsiveHeaderWrapper";
import Breadcrumb from "@/components/Breadcrumb/index";
import WorksClient from "../../WorksClient";

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

// 作品を取得するクエリ - menuOrderでソート、menuOrderフィールドを追加
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

// ヘルパー関数
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
    devLog(`Fetching works for page ${requestedPage}...`);

    const skillStructure = await determineSkillStructure();
    const allWorks = await fetchAllWorks(skillStructure);
    
    // 開発環境でのソート確認
    devLog("📊 Works order check (first 10) for paginated page:");
    allWorks.slice(0, 10).forEach((work, index) => {
      devLog(`${index + 1}. ${work.title} (menuOrder: ${work.menuOrder || 0})`);
    });
    
    const totalWorks = allWorks.length;
    const totalPages = Math.ceil(totalWorks / WORKS_PER_PAGE);

    const currentPage = Math.max(1, Math.min(requestedPage, totalPages || 1));

    const startIndex = (currentPage - 1) * WORKS_PER_PAGE;
    const endIndex = startIndex + WORKS_PER_PAGE;
    const currentPageWorks = allWorks.slice(startIndex, endIndex);

    devLog(
      `Found ${totalWorks} total works, showing page ${currentPage}/${totalPages}`
    );

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

// ビルド時に総ページ数を計算する
async function calculateTotalPages() {
  try {
    devLog("Calculating total pages for static generation...");
    const skillStructure = await determineSkillStructure();
    const allWorks = await fetchAllWorks(skillStructure);
    const totalPages = Math.ceil(allWorks.length / WORKS_PER_PAGE);
    devLog(`Total works: ${allWorks.length}, Total pages: ${totalPages}`);
    return Math.max(1, totalPages);
  } catch (error) {
    console.error("Error calculating total pages:", error);
    return 1;
  }
}

// 静的パラメータの生成（2ページ目以降のみ）
export async function generateStaticParams() {
  try {
    const totalPages = await calculateTotalPages();
    const params = [];

    // 2ページ目以降のみ生成（1ページ目は /all-works で処理）
    for (let i = 2; i <= totalPages; i++) {
      params.push({ page: i.toString() }); // 文字列として返す
    }

    devLog(`Generated static params:`, params);
    devLog(`Total pages generated: ${params.length} (excluding page 1)`);
    return params;
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// メタデータを動的に生成
export async function generateMetadata({ params }) {
  const page = params?.page ? parseInt(params.page) : 2;

  return {
    title: `作品一覧 - ページ${page}`,
    description: `作品の一覧ページです (${page}ページ目)`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

// SSGでビルド時に静的に生成
export const dynamic = 'force-static';
export const revalidate = 86400;

// ページネーションコンポーネント
function Pagination({ pagination, basePath = "/all-works" }) {
  const { currentPage, totalPages, hasNextPage, hasPreviousPage } = pagination;

  if (totalPages <= 1) return null;

  const getPageUrl = (pageNum) => {
    if (pageNum === 1) return basePath;
    return `${basePath}/page/${pageNum}`;
  };

  const renderPageNumbers = () => {
    const pages = [];

    // 総ページ数が3以下の場合は全ページを表示
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
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
      return pages;
    }

    // 総ページ数が4以上の場合：常に「1 2 3 ... 最終ページ」パターン

    // 1. 最初の3ページを表示
    for (let i = 1; i <= 3; i++) {
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

    // 2. 現在のページが4以上で最終ページでない場合、現在のページも表示
    if (currentPage > 3 && currentPage < totalPages) {
      pages.push(
        <span key="dots1" className={styles.pageDots}>
          ...
        </span>
      );

      pages.push(
        <Link
          key={currentPage}
          href={getPageUrl(currentPage)}
          className={`${styles.pageLink} ${styles.currentPage}`}
        >
          {currentPage}
        </Link>
      );
    }

    // 3. 総ページ数が4の場合は「...」なしで最終ページを表示
    if (totalPages === 4) {
      pages.push(
        <Link
          key={totalPages}
          href={getPageUrl(totalPages)}
          className={`${styles.pageLink} ${
            totalPages === currentPage ? styles.currentPage : ""
          }`}
        >
          {totalPages}
        </Link>
      );
    } else {
      // 4. 総ページ数が5以上の場合は「...」付きで最終ページを表示
      pages.push(
        <span key="dots2" className={styles.pageDots}>
          ...
        </span>
      );

      pages.push(
        <Link
          key={totalPages}
          href={getPageUrl(totalPages)}
          className={`${styles.pageLink} ${
            totalPages === currentPage ? styles.currentPage : ""
          }`}
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

// メインコンポーネント（2ページ目以降用）
export default async function WorksPage({ params }) {
  // URLパラメータからページ番号を取得（2ページ目以降）
  const page = params?.page ? parseInt(params.page) : 2;

  devLog(`Rendering works page: ${page}`);

  const { works, skillStructure, pagination, error } =
    await getAllWorksWithPagination(page);

  // エラーが発生した場合の表示
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
            <Link href="/all-works" className={styles.retryLink}>
              作品一覧に戻る
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ページ範囲外の場合
  if (works.length === 0) {
    return (
      <div className={styles.allWorks}>
        <ResponsiveHeaderWrapper className={styles.worksHeader} />
        <div className={styles.breadcrumbWrapper}>
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <main className={styles["works-container"]}>
          <div className={styles.noResults}>
            <h2>ページが見つかりません</h2>
            <p>指定されたページは存在しません。</p>
            <Link href="/all-works" className={styles.homeLink}>
              作品一覧の最初のページに戻る
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // 作品データがある場合のレンダリング
  return (
    <div className={styles.allWorks}>
      <ResponsiveHeaderWrapper className={styles.worksHeader} />
      <div className={styles.breadcrumbWrapper}>
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <WorksClient
        works={works}
        skillStructure={skillStructure}
        pagination={pagination}
      />
    </div>
  );
}