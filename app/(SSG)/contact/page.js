import Script from "next/script";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import { generateBreadcrumb } from "@/lib/utils/generateBreadcrumb";
import ResponsiveHeaderWrapper from "@/components/ResponsiveHeaderWrapper";
import ContactForm from "./contactForm";
import { ScrollMotion } from "@/components/animation/Stagger/ScrollMotion";
import styles from "./page.module.scss";

const breadcrumbItems = generateBreadcrumb("/contact");

export default function ContactPage() {
  return (
    <>
      {/* ✅ Google reCAPTCHA v3 Script */}
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        async
        defer
        strategy="afterInteractive"
      />

      <div className={styles.contact}>
        {/* 背景レイヤー画像 */}
        <div className={styles.left_1stLineParent}>
          <Image
            className={styles.left_1stLine}
            src="/LowerLayer/PC/left_1stLine.webp"
            alt="left_1stLine"
            fill
          />
        </div>
        <div className={styles.left_2ndLineParent}>
          <Image
            className={styles.left_2ndLine}
            src="/LowerLayer/PC/left_2ndLine.webp"
            alt="left_2ndLine"
            fill
          />
        </div>
        <div className={styles.right_1stLineParent}>
          <Image
            className={styles.right_1stLine}
            src="/LowerLayer/PC/right_1stLine.webp"
            alt="right_1stLine"
            fill
          />
        </div>
        <div className={styles.ballParent}>
          <Image
            className={styles.ball}
            src="/LowerLayer/PC/ball.webp"
            alt="ball"
            fill
          />
        </div>
        <div className={styles.right_2ndParent}>
          <Image
            className={styles.right_2nd}
            src="/LowerLayer/PC/right_2nd.webp"
            alt="right_2nd"
            fill
          />
        </div>

        {/* ✅ ドロワー付きレスポンシブヘッダー */}
        <ResponsiveHeaderWrapper className={styles.thanksHeader} />

        <div className={styles.contact__inner}>
          <div className={styles.Bread}>
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <div className={styles.contact__title}>
            <h1 className={styles.contact__h1}>お問い合わせ</h1>
            <h2 className={styles.contact__h2}>Contact</h2>
          </div>

          <ScrollMotion
            delay={0.2}
            duration={0.6}
            yOffset={30}
            threshold={0.3}
            once={true}
          >
            <p className={styles.contact____explanation}>
              無料でご相談、お見積もりを承っております。
              <br />
              お気軽にご相談ください。
            </p>
          </ScrollMotion>

          {/* ✅ クライアント動作含む ContactForm */}
          <ContactForm />
        </div>
      </div>
    </>
  );
}
