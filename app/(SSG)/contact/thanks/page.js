import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import { generateBreadcrumb } from "@/lib/utils/generateBreadcrumb";
import ResponsiveHeaderWrapper from "@/components/ResponsiveHeaderWrapper";
import styles from "./page.module.scss";

const breadcrumbItems = generateBreadcrumb("/contact/thanks");

export default function ContactThanksPage() {
  return (
    <div className={styles.thanks}>
      {/* 背景画像レイヤー */}
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

      {/* ✅ ヘッダー（PC/SP + Drawer切り替えをクライアント側に移譲） */}
      <ResponsiveHeaderWrapper className={styles.thanksHeader} />

      {/* パンくずリスト */}
      <div className={styles.Bread}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* メインメッセージ */}
      <main>
        <h1 className={styles.thanks404}>Thank you !</h1>
        <p className={styles.thanksP}>
          お問い合わせいただきありがとうございました。
          <br />
          当日、または翌営業日までにご連絡差し上げます。
        </p>
        <div className={styles.thanksAttention}>
          <p>
            <strong>
              返信メールが届かない場合は、迷惑メールフォルダもあわせてご確認ください。
            </strong>
          </p>
        </div>
      </main>
    </div>
  );
}
