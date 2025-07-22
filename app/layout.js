import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.scss";
import Footer from "@/components/SSG/Footer/Footer";
import Script from "next/script";
import { Providers } from "@/providers";
import ClientWrapper from '@/components/Loading/ClientWrapper'; // ClientWrapper を追加

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "bakushin's portfolio",
  description: "bakushin's portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* index メタタグ（デフォルト設定） */}
        <meta name="robots" content="index, follow" />

        {/* ファビコン関連 */}
        <link rel="icon" type="image/webp" sizes="64x62" href="/favicon.webp" />
        <meta name="theme-color" content="#ffffff" />

        {/* OGP・Twitterカード */}
        <meta property="og:title" content="bakushin's portfolio" />
        <meta property="og:description" content="bakushin's portfolio" />
        <meta property="og:image" content="/OGP.webp" />
        <meta property="og:url" content="https://bakushin.blog" />
        <meta name="twitter:card" content="summary_large_image" />

        {/* フォントの追加 */}
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
<link 
  href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Noto+Sans+JP:wght@100..900&display=swap" 
  rel="stylesheet" 
/>

      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <ClientWrapper> {/* ClientWrapper を復活 */}
            {children}
            <Footer />
          </ClientWrapper>
        </Providers>
      </body>
    </html>
  );
}