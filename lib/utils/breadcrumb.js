import Link from 'next/link';
// スタイルのインポートを維持しない

export default function Breadcrumb({ items }) {
  if (!items || items.length <= 1) return null;

  // JSON-LDスキーマデータの生成
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${process.env.NEXT_PUBLIC_SITE_URL || ''}${item.path}`,
    })),
  };

  return (
    <>
      {/* JSON-LD構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      
      {/* パンくずリストUI - クラス名を直接指定 */}
      <nav aria-label="breadcrumb" className="breadcrumb">
        <ol className="breadcrumb-list">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <li 
                key={`breadcrumb-${index}`}
                className={`breadcrumb-item ${isLast ? 'active' : ''}`}
              >
                {index > 0 && (
                  <span className="breadcrumb-separator">/</span>
                )}
                
                {isLast ? (
                  <span className="breadcrumb-current" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path} className="breadcrumb-link">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}