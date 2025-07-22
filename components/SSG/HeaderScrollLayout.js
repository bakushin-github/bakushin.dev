"use client";
import { useEffect, useState } from "react";
import Header from "@/components/SSG/Header/Header/Header";
import Header_after from "@/components/SSG/Header/Header_after/Header_after";
import Drawer_menu from "@/components/SSG/Drawer/Drawer_menu/Drawer_menu";
import Fv from "@/components/SSG/Fv/Fv";
import Works from "@/components/SSG/Works/Works";
import About from "@/components/SSG/About/About";
import { useLoadingContext } from '@/components/Loading/ClientWrapper';

export default function HeaderScrollLayout() {
  const [showHeaderAfter, setShowHeaderAfter] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { shouldTriggerAnimation } = useLoadingContext();

  const toggleMenu = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  // ↓Works sectionをトリガー
  // useEffect(() => {
  //   const handleScroll = () => {
  //     // 複数のIDを試してみる
  //     const worksSection = document.getElementById("Works") || 
  //                         document.getElementById("works") || 
  //                         document.querySelector("[data-section='works']");
      
  //     if (worksSection) {
  //       const worksTop = worksSection.getBoundingClientRect().top;
  //       const shouldShow = worksTop <= 100;
        
  //       if (shouldShow !== showHeaderAfter) {
  //         setShowHeaderAfter(shouldShow);
  //       }
  //     }
  //   };

  //   // 初期状態をチェック
  //   setTimeout(() => {
  //     handleScroll();
  //   }, 1000);

  //   // スクロールイベントリスナーを追加
  //   window.addEventListener("scroll", handleScroll, { passive: true });
    
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, [shouldTriggerAnimation, showHeaderAfter]);


  useEffect(() => {
  const handleScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // 110px(headerのheight) スクロールしたらヘッダー切り替え
    const shouldShow = scrollTop >= 110;

    if (shouldShow !== showHeaderAfter) {
      setShowHeaderAfter(shouldShow);
    }
  };

  // 初期チェック（描画直後）
  setTimeout(() => {
    handleScroll();
  }, 1000);

  window.addEventListener("scroll", handleScroll, { passive: true });

  return () => window.removeEventListener("scroll", handleScroll);
}, [shouldTriggerAnimation, showHeaderAfter]);


  return (
    <>
      {/* 条件付きでヘッダーを表示 */}
      {!showHeaderAfter ? (
        <Header toggleMenu={toggleMenu} />
      ) : (
        <Header_after toggleMenu={toggleMenu} />
      )}

      {/* ドロワーメニュー */}
      <Drawer_menu
        isOpen={isDrawerOpen}
        closeDrawer={closeDrawer}
        toggleMenu={toggleMenu}
      />

      {/* FV セクション */}
      <div id="Fv">
        <Fv />
      </div>
      
      {/* Works セクション - HeaderScrollLayout側でのみIDを設定 */}
      <div id="Works" data-section="works">
        <Works />
      </div>
      
      {/* その他のセクション */}
      <div id="About">
        <About />
      </div>
    </>
  );
}