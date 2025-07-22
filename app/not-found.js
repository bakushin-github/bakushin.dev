import Image from "next/image";
import styles from "../components/SSG/not-found.module.scss";
import ResponsiveHeaderWrapper from "@/components/ResponsiveHeaderWrapper";

export default function NotFoundPage() {
  return (
    <div className={styles.not_found}>
      {/* 背景画像 */}
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
      <div className={styles.right_2ndParent}>
        <Image
          className={styles.right_2nd}
          src="/LowerLayer/PC/right_2nd.webp"
          alt="right_2nd"
          fill
        />
      </div>

      {/* ✅ サーバー側でクライアント切り替えをラップ */}
      <ResponsiveHeaderWrapper className={styles.thanksHeader} />

      {/* 404 メッセージ */}
      <h1 className={styles.not_found404}>404</h1>
      <p className={styles.not_foundP}>
        お探しのページが見つかりません。
        <br />
        一時的にアクセスできない状況にあるか、移動もしくは削除された可能性があります。
      </p>
    </div>
  );
}
