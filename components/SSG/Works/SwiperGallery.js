"use client";
import React, { useEffect, useState } from "react";
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
      nodes { id title slug excerpt(format: RENDERED) featuredImage { node { sourceUrl(size: MEDIUM) altText } } works { skill } categories { nodes { id name slug } } }
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
const [isClicked, setIsClicked] = useState(false);
const [clickedSlug, setClickedSlug] = useState(null);

const handleClick = () => {
  if (isClicked) return;
  setIsClicked(true);
};

const handleTransitionEnd = (e) => {
  if (isClicked && e.propertyName === "transform") {
    router.push("/all-works");
  }
};
  const [isClient, setIsClient] = useState(false);
  const { loading, error, data } = useQuery(GET_WORKS_QUERY, { skip: !isClient });
  
  useEffect(() => { setIsClient(true); }, []);
  
  if (!isClient || loading || error || !data?.works?.nodes) { 
    return <div className={styles.worksContents}><p style={{ textAlign: 'center' }}>Loading...</p></div>; 
  }
  
  const worksToDisplay = data.works.nodes;

  return (
    <div className={styles.worksContents}>
      <Swiper
        modules={[Autoplay, Navigation, FreeMode]}
        spaceBetween={26}
        slidesPerView={"auto"}
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        navigation={{
          prevEl: `.${styles.swiperButtonPrev}`,
          nextEl: `.${styles.swiperButtonNext}`,
        }}
        breakpoints={{
          0: {
            spaceBetween: 20, // 767px以下での間隔（例：20px）
          },
          768: {
            spaceBetween: 24, // 768px以上での間隔（例：24px）
          },
        }}
      >
        {worksToDisplay.map((work, index) => (
          <SwiperSlide key={`${work.id}-${index}`}>
           <div
  className={styles["work-imageLink"]}
  role="link"
  tabIndex={0}
  onClick={() => setClickedSlug(work.slug)}
>
  <article className={styles.workCard}>
    <header className={styles.workHeader}>
      <span className={styles.workCategory}>{getCategoryName(work)}</span>
      <Image
        src={work.featuredImage?.node?.sourceUrl || "/About/PC/Icon.webp"}
        alt={work.featuredImage?.node?.altText || "作品画像"}
        fill
        style={{ objectFit: "cover" }}
        priority={index < 3}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </header>
    <footer className={styles.workFooter}>
      <h3
        className={`${styles.title} ${clickedSlug === work.slug ? styles.animate : ""}`}
        onAnimationEnd={() => {
          if (clickedSlug === work.slug) {
            router.push(`/all-works/${work.slug}`);
          }
        }}
      >
        {truncateTitle(work.title)}
      </h3>
      <p className={styles.skill}>{formatSkill(work.works?.skill || work.skill || "")}</p>
      <div className={styles.worksLink}></div>
    </footer>
  </article>
</div>

          </SwiperSlide>
        ))}
      </Swiper>
      <div className={styles.navigationContainer}>
        <div className={styles.arrowButtons}>
          <div className={styles.swiperButtonPrev}></div>
          <div className={styles.swiperButtonNext}></div>
        </div>
         <div className={styles.listLink}>
    <button
      className={styles.ListViewButton}
      onClick={handleClick}
      onTransitionEnd={handleTransitionEnd}
    >
      一覧をみる
    </button>
  </div>
      </div>
    </div>
  );
}

export default SwiperGallery;