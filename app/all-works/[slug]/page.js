// app/all-works/[slug]/page.jsx
// このファイルはサーバーコンポーネントなので、"use client" ディレクティブは不要です。

import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import ResponsiveHeaderWrapper from "@/components/ResponsiveHeaderWrapper";
import Breadcrumb from "@/components/Breadcrumb/index";
// 同じフォルダに移動したWorkDetailClientをインポートします
import WorkDetailClient from "./WorkDetailClient"; 
import styles from "./page.module.scss";
import Link from "next/link";

// ApolloClientのインスタンスを生成
const client = new ApolloClient({
  uri:
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
    "https://your-wordpress-site.com/graphql",
  cache: new InMemoryCache(),
});

// 全ての作品データを取得するGraphQLクエリ
const GET_ALL_WORKS = gql`
  query GetAllWorks {
    works {
      nodes {
        id
        title
        slug
        content
        featuredImage {
          node {
            sourceUrl
            altText
          }
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

// パンくずリストのアイテムを生成するヘルパー関数
function createBreadcrumbs(slug, title) {
  return [
    { name: "ホーム", path: "/" },
    { name: "全作品一覧", path: "/all-works" },
    { name: title || "作品詳細", path: `/all-works/${slug}` },
  ];
}

// Next.jsのSSG (Static Site Generation) 設定
// force-static: ビルド時に静的なページを生成
// revalidate: ページの再生成間隔 (3600秒 = 1時間)
export const dynamic = 'force-static';
export const revalidate = 86400;


// generateStaticParams: 動的ルーティングの静的パスをビルド時に生成
export async function generateStaticParams() {
  try {
    const { data } = await client.query({
      query: GET_ALL_WORKS,
      fetchPolicy: "network-only", // キャッシュではなく常にネットワークからフェッチ
    });

    const works = data?.works?.nodes || [];

    // slugを持つ作品のみを抽出し、{ slug: work.slug } の形式で返す
    return works
      .filter((work) => !!work.slug)
      .map((work) => ({
        slug: work.slug,
      }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return []; // エラー時は空の配列を返す
  }
}

// generateMetadata: ページのメタデータを生成
export async function generateMetadata({ params }) {
  try {
    // paramsオブジェクトをawaitして、プロパティにアクセスする
    const resolvedParams = await params;
    const slug = resolvedParams?.slug || "";

    const { data } = await client.query({ query: GET_ALL_WORKS });

    const works = data?.works?.nodes || [];
    const work = works.find((work) => work.slug === slug);

    if (!work) {
      // 作品が見つからない場合のメタデータ
      return {
        title: "作品が見つかりません",
        description: "指定された作品は存在しません。",
      };
    }

    // 作品が見つかった場合のメタデータ
    return {
      title: `${work.title} | 作品詳細`,
      description: work.excerpt || `${work.title}の詳細ページです。`,
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    // エラー発生時のデフォルトメタデータ
    return {
      title: "作品詳細",
      description: "作品の詳細ページです。",
    };
  }
}

// WorkDetailPage: 作品詳細ページのメインコンポーネント (サーバーコンポーネント)
export default async function WorkDetailPage({ params }) {
  // paramsオブジェクトをawaitして、プロパティにアクセスする
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";

  let work = null;
  let error = null;

  try {
    const { data } = await client.query({ query: GET_ALL_WORKS });
    const works = data?.works?.nodes || [];
    work = works.find((item) => item.slug === slug); // slugに一致する作品を検索
    if (!work) {
      error = new Error("作品が見つかりませんでした。");
      console.log("Work not found for slug in server component:", slug);
    }
  } catch (err) {
    console.error("Error fetching work data in server component:", err);
    error = err;
  }

  // パンくずリストアイテムを生成 (workが存在しない場合もslugは渡す)
  const breadcrumbItems = createBreadcrumbs(slug, work?.title);

  // エラーまたは作品が見つからない場合のフォールバックUI
  if (error || !work) {
    return (
      <>
        <ResponsiveHeaderWrapper className={styles.worksHeader} />
        <div className={styles.breadcrumbWrapper}>
          <Breadcrumb items={createBreadcrumbs(slug, "作品が見つかりません")} />
        </div>
        <main className={styles.container}>
          <div className={styles.notFound}>
            <h1>作品が見つかりませんでした</h1>
            <p>スラッグ: {slug}</p>
            {error && <p>エラー: {error.message}</p>}
            <Link href="/all-works" className={styles.backButton}>
              全作品一覧に戻る
            </Link>
          </div>
        </main>
      </>
    );
  }

  // 作品データが取得できた場合、クライアントコンポーネントをレンダリング
  // 必要なデータをpropsとして渡します
  return (
    <><div className={styles.allWorks}>
      <ResponsiveHeaderWrapper className={styles.worksHeader} />
      <div className={styles.breadcrumbWrapper}>
        <Breadcrumb items={breadcrumbItems} />
      </div>
      {/* データをWorkDetailClientに渡してレンダリング */}
      <WorkDetailClient work={work} slug={slug} breadcrumbItems={breadcrumbItems} /></div>
    </>
  );
}