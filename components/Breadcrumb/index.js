import Link from 'next/link';
import styles from './Breadcrumb.module.scss';

export default function Breadcrumb({ items, className }) {
  if (!items || items.length <= 1) return null;

  // JSON-LDスキーマデータの生成
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${process.env.NEXT_PUBLIC_SITE_URL}${item.path}`,
    })),
  };

  return (
    <>
      {/* JSON-LD構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      
      {/* パンくずリストUI */}
      <nav aria-label="breadcrumb"  className={`${styles.bread} ${className || ''}`}>
        <ol className={styles.list}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <li 
                key={`breadcrumb-${index}`}
                className={`${styles.item} ${isLast ? styles.active : ''}`}
              >
                {index > 0 && (
                  <span className={styles.separator}>{'>'}</span>
                )}
                
                {isLast ? (
                  <span className={styles.current} aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path} className={styles.link}>
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
