"use client";
import { useState, useEffect } from "react";
import Header from "@/components/SSG/Header/Header/Header";
import Header_after from "@/components/SSG/Header/Header_after/Header_after";
import Header_Sp from "@/components/SSG/Drawer/Sp/Drawer_menu/Drawer_menuSP";
import Drawer_menu from "@/components/SSG/Drawer/Drawer_menu/Drawer_menu";

export default function ResponsiveHeaderWrapper({ className }) {
  const [windowWidth, setWindowWidth] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHeaderAfter, setShowHeaderAfter] = useState(false);
  const BREAKPOINT_SP = 767;

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowHeaderAfter(window.scrollY >= 110);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {windowWidth > BREAKPOINT_SP ? (
        showHeaderAfter ? (
          <Header_after className={className} toggleMenu={toggleMenu} isMenuOpen={isMenuOpen} />
        ) : (
          <Header className={className} toggleMenu={toggleMenu} isMenuOpen={isMenuOpen} />
        )
      ) : (
        <Header_Sp toggleMenu={toggleMenu} isMenuOpen={isMenuOpen} />
      )}
      <Drawer_menu isOpen={isMenuOpen} toggleMenu={toggleMenu} closeDrawer={() => setIsMenuOpen(false)} />
    </>
  );
}
