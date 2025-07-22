import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import { generateBreadcrumb } from "@/lib/utils/generateBreadcrumb";
import ResponsiveHeaderWrapper from "@/components/ResponsiveHeaderWrapper";
import styles from "./page.module.scss";

// パスを静的に渡して生成
const breadcrumbItems = generateBreadcrumb("/privacy_policy");

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.privacy}>
      {/* 背景画像類 */}
      <Image
        className={styles.left_1stLine}
        src="/LowerLayer/PC/left_1stLine.webp"
        alt="left_1stLine"
        width={439}
        height={565}
      />
      <Image
        className={styles.left_2ndLine}
        src="/LowerLayer/PC/left_2ndLine.webp"
        alt="left_2ndLine"
        width={547}
        height={350}
      />
      <Image
        className={styles.right_1stLine}
        src="/LowerLayer/PC/right_1stLine.webp"
        alt="right_1stLine"
        width={342}
        height={429}
      />
      <Image
        className={styles.right_2ndLine}
        src="/LowerLayer/PC/right_2ndLine.webp"
        alt="right_2ndLine"
        width={644}
        height={1009}
      />

      {/* ドロワー付きレスポンシブヘッダー（クライアントで動作） */}
      <ResponsiveHeaderWrapper className={styles.thanksHeader} />

      <div className={styles.privacy__inner}>
        <div className={styles.Bread}>
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className={styles.privacy__title}>
          <h1 className={styles.privacy__h1}>プライバシーポリシー</h1>
          <h2 className={styles.privacy__h2}>Privacy Policy</h2>
        </div>

        <div className={styles.privacy__policy}>
          <article className={styles.pp__article}>
            <section className={styles.pp__section}>
              <p>
                本ウェブサイトにおける、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」といいます。）を定めます。
              </p>
              <h3 className={styles.pp__h3}>第1条（個人情報）</h3>
              <p>
                「個人情報」とは、個人情報保護法にいう「個人情報」を指すもので、生存する個人に関する情報であって、氏名、住所、電話番号、メールアドレスなどの記述によって特定の個人を識別できる情報を指します。
              </p>
            </section>
            <section className={styles.pp__section}>
              <h3 className={styles.pp__h3}>第2条（個人情報の収集方法）</h3>
              <p>
                当方は、ユーザーからのお問い合わせを受ける際に、氏名、住所、電話番号、メールアドレスなどの個人情報をお尋ねすることがあります。
              </p>
            </section>
            <section className={styles.pp__section}>
              <h3 className={styles.pp__h3}>第3条（個人情報を収集・利用する目的）</h3>
              <p>当方が収集した個人情報は、以下の目的で利用します。</p>
              <ul>
                <li>ユーザーからのお問い合わせに回答するため</li>
                <li>お問い合わせ内容に関連する情報を提供するため</li>
                <li>必要に応じたご連絡のため</li>
                <li>不正利用ユーザーの特定および対応のため</li>
                <li>上記の利用目的に付随する目的</li>
              </ul>
            </section>
            <section className={styles.pp__section}>
              <h3 className={styles.pp__h3}>第4条（利用目的の変更）</h3>
              <p>
                利用目的が変更前と合理的に関連すると認められる場合に限り変更できるものとします。
              </p>
            </section>
            <section className={styles.pp__section}>
              <h3 className={styles.pp__h3}>第5条（第三者提供）</h3>
              <p>
                ユーザーの同意なく第三者に個人情報を提供しません。ただし、法令に基づく場合は除きます。
              </p>
            </section>
            <section className={styles.pp__section}>
              <h3 className={styles.pp__h3}>第6条（個人情報の開示）</h3>
              <p>
                ご本人からの開示請求には速やかに対応しますが、他人の権利を害する場合などは開示できません。
              </p>
            </section>
            <section className={styles.pp__section}>
              <h3 className={styles.pp__h3}>第7条（訂正および削除）</h3>
              <p>自己の個人情報の訂正や削除は所定の手続きで請求できます。</p>
            </section>
            <section className={styles.pp__section}>
              <h3 className={styles.pp__h3}>第8条（利用停止等）</h3>
              <p>本人からの請求に基づき、利用停止が必要と判断した場合には速やかに対応します。</p>
            </section>
            <section className={styles.pp__section}>
              <h3 className={styles.pp__h3}>第9条（ポリシーの変更）</h3>
              <p>変更は本サイト上で公表した時点で効力を発生します。</p>
            </section>
            <section className={styles.pp__section}>
              <h3 className={styles.pp__h3}>第10条（お問い合わせ窓口）</h3>
              <p>本ポリシーに関するお問い合わせは、お問い合わせフォームからご連絡ください。</p>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}
