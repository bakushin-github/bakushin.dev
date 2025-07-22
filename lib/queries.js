import { gql } from '@apollo/client';

// ✅ テスト済み：ID除外クエリ（最高のSEO性能）
export const GET_OTHER_POSTS_BY_ID = gql`
  query GetOtherPostsById($excludeId: ID!, $first: Int = 12) {
    posts(
      first: $first, 
      where: { 
        notIn: [$excludeId],
        status: PUBLISH
      }
    ) {
      nodes {
        id
        title
        slug
        excerpt
        date
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