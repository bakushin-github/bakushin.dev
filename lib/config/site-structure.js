export const siteStructure = {
  home: { path: '/', label: 'ホーム' },
  sections: [
    {
      id: 'blog',
      path: '/blog',
      label: 'ブログ',
      isWordPress: true,
    },
    {
      id: 'works',
      path: '/works',
      label: '実績紹介',
      isWordPress: true,
    },
    {
      id: 'contact',
      path: '/contact',
      label: 'お問い合わせ',
      isWordPress: false,
      children: [
        { path: '/contact/thanks', label: 'お問い合わせ完了' }
      ]
    },
    {
      id: 'faq',
      path: '/faq',
      label: 'よくある質問',
      isWordPress: false,
    },
    {
      id: 'all-works',
      path: '/all-works',
      label: '全作品一覧',
      isWordPress: false,
    },
    {
      id: 'all-blogs',
      path: '/all-blogs',
      label: '全記事一覧',
      isWordPress: false,
    },
  ]
};

// 別途関数を作成して動的に子ページを取得
export async function getAllWorksChildren() {
  // GraphQLクエリの例
  const query = `
    query GetAllWorks {
      works {
        nodes {
          slug
          title
        }
      }
    }
  `;

  try {
    // GraphQLエンドポイントにリクエスト
    const response = await fetch('あなたのGraphQLエンドポイント', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const { data } = await response.json();
    
    // 取得したデータから子ページを生成
    const children = data.works.nodes.map(work => ({
      path: `/all-works/${work.slug}`,
      label: work.title,
      slug: work.slug, // 必要に応じて追加のデータを保持できます
    }));

    return children;
  } catch (error) {
    console.error('GraphQLからの作品データ取得に失敗しました:', error);
    return [];
  }
}