"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import Image from "next/image";
import styles from "./SwiperGallery.module.scss";
import Link from "next/link";
import { useQuery, gql } from "@apollo/client";
import ListViewButton from "../ListViewButton/ListViewButton";
import { useRouter } from "next/navigation";

const GET_WORKS_QUERY = gql`
  query GetWorksQuery {
    works(first: 15) {
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

const truncateTitle = (title, maxLength = 25) => { 
  if (!title) return ""; 
  const plainText = String(title).replace(/<[^>]*>?/gm, ""); 
  return plainText.length <= maxLength ? plainText : plainText.substring(0, maxLength) + "..."; 
};

const formatSkill = (skillValue) => { 
  if (!skillValue) return ""; 
  return Array.isArray(skillValue) ? skillValue.filter((s) => s).join(", ") : String(skillValue); 
};

const getCategoryName = (work) => { 
  if (!work?.categories?.nodes?.length) return ""; 
  return work.categories.nodes[0].name; 
};

function SwiperGallery() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [clickedWorkSlug, setClickedWorkSlug] = useState(null);
  const { loading, error, data } = useQuery(GET_WORKS_QUERY, { skip: !isClient });
  
  useEffect(() => { 
    setIsClient(true); 
  }, []);

  // カードクリック処理をシンプルに
  const handleCardClick = useCallback((e, work) => {
    e.preventDefault();
    
    // 既にクリック済みの場合は何もしない
    if (clickedWorkSlug) return;
    
    console.log(`Card clicked: ${work.slug}`);
    setClickedWorkSlug(work.slug);

    // アニメーション開始
    const target = e.currentTarget;
    const titleElement = target.querySelector(`.${styles.title}`);
    const linkElement = target.querySelector(`.${styles.worksLink}`);
    
    if (titleElement) {
      titleElement.classList.add(styles.animate);
    }
    
    if (linkElement) {
      linkElement.classList.add(styles.clicked);
    }

    // 800ms後に遷移（アニメーション時間に合わせる）
    setTimeout(() => {
      console.log(`Navigating to: /all-works/${work.slug}`);
      router.push(`/all-works/${work.slug}`);
    }, 800);
  }, [router, clickedWorkSlug]);

  // 一覧ボタンのクリック処理をシンプルに
  const handleListClick = useCallback((e) => {
    e.preventDefault();
    
    if (clickedWorkSlug) return;
    
    console.log('List button clicked');
    
    // ボタンにアニメーションクラスを追加
    const target = e.currentTarget;
    target.classList.add(styles.listClicked);
    
    // アニメーション時間後に遷移
    setTimeout(() => {
      console.log('Navigating to: /all-works');
      router.push("/all-works");
    }, 500); // ボタンアニメーション時間に合わせる
  }, [router, clickedWorkSlug]);

  if (!isClient || loading || error || !data?.works?.nodes) { 
    return (
      <div className={styles.worksContents}>
        <p style={{ textAlign: 'center', color: 'white' }}>
          {loading ? 'Loading...' : error ? 'Error loading works' : 'No works found'}
        </p>
      </div>
    ); 
  }
  
  const worksToDisplay = data.works.nodes;

  return (
    <div className={styles.worksContents}>
      <Swiper
        modules={[Autoplay, Navigation, FreeMode]}
        spaceBetween={26}
        slidesPerView={"auto"}
        loop={true}
        autoplay={{ 
          delay: 3000, 
          disableOnInteraction: false,
          pauseOnMouseEnter: true // ホバー時に一時停止
        }}
        navigation={{
          prevEl: `.${styles.swiperButtonPrev}`,
          nextEl: `.${styles.swiperButtonNext}`,
        }}
        breakpoints={{
          0: {
            spaceBetween: 20,
          },
          768: {
            spaceBetween: 24,
          },
        }}
      >
        {worksToDisplay.map((work, index) => (
          <SwiperSlide key={`${work.id}-${index}`}>
            <div
              className={`${styles["work-imageLink"]} ${
                clickedWorkSlug === work.slug ? styles.cardClicked : ''
              }`}
              role="button"
              tabIndex={0}
              onClick={(e) => handleCardClick(e, work)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(e, work);
                }
              }}
              style={{ 
                cursor: clickedWorkSlug ? 'wait' : 'pointer',
                pointerEvents: clickedWorkSlug ? 'none' : 'auto'
              }}
            >
              <article className={styles.workCard}>
                <header className={styles.workHeader}>
                  {getCategoryName(work) && (
                    <span className={styles.workCategory}>
                      {getCategoryName(work)}
                    </span>
                  )}
                  <Image
                    src={work.featuredImage?.node?.sourceUrl || "/About/PC/Icon.webp"}
                    alt={work.featuredImage?.node?.altText || `${truncateTitle(work.title)}の作品画像`}
                    fill
                    style={{ objectFit: "cover" }}
                    priority={index < 3}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </header>
                <footer className={styles.workFooter}>
                  <h3 className={styles.title}>
                    {truncateTitle(work.title)}
                  </h3>
                  <p className={styles.skill}>
                    {formatSkill(work.works?.skill || work.skill || "")}
                  </p>
                  <div className={styles.worksLink}></div>
                </footer>
              </article>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      <div className={styles.navigationContainer}>
        <div className={styles.arrowButtons}>
          <button 
            className={styles.swiperButtonPrev}
            aria-label="前のスライド"
            disabled={clickedWorkSlug}
          ></button>
          <button 
            className={styles.swiperButtonNext}
            aria-label="次のスライド"
            disabled={clickedWorkSlug}
          ></button>
        </div>
        
        <div className={styles.listLink}>
          <button
            className={styles.ListViewButton}
            onClick={handleListClick}
            disabled={clickedWorkSlug}
            style={{ 
              cursor: clickedWorkSlug ? 'wait' : 'pointer',
              opacity: clickedWorkSlug ? 0.7 : 1
            }}
          >
            一覧をみる
          </button>
        </div>
      </div>
    </div>
  );
}

export default SwiperGallery;