"use client";

import React from "react";
import Script from "next/script";
import styles from "./page.module.scss";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useRecaptcha from "@/hooks/useRecaptcha";

// Zodでバリデーションスキーマを定義
const contactSchema = z.object({
  company: z.string().optional(),
  name: z.string().min(1, "お名前がまだのようです。入力をお願いできますか？"),
  email: z.string().email("メールアドレスが正しくないようです。もう一度ご確認ください。"),
  inquiry: z.array(z.string()).min(1, "内容を選んでください。ピッタリじゃなくても大丈夫です！"),
  detail: z.string().min(1, "空っぽみたいです◎ひとことでもいいので、わかる範囲で書いてもらえたら嬉しいです！").max(1000, "1000文字以内で入力してください"),
  privacy: z.boolean().refine(val => val === true, {
    message: "ごめんなさい、プライバシーポリシーへの同意が必要です。"
  }),
  website: z.string().optional() // ハニーポットフィールド
});

export default function ContactForm() {
  const router = useRouter();
  const { recaptchaLoaded, executeRecaptcha } = useRecaptcha();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(null);
  const formRef = React.useRef(null);

  // React Hook Formの初期化
  const { register, handleSubmit, control, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      company: "",
      name: "",
      email: "",
      inquiry: ["ホームページ制作"],
      detail: "",
      privacy: false,
      website: "" // ハニーポットフィールド
    }
  });

  // フォーム送信処理
  const onSubmit = async (data, event) => {
    event.preventDefault(); // デフォルト送信を一時停止
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. ハニーポットチェック
      if (data.website && data.website.trim() !== "") {
        console.log("スパム判定: フォーム送信を中止");
        setSubmitError("送信に失敗しました。");
        setIsSubmitting(false);
        return;
      }

      // 2. reCAPTCHA検証
      const token = await executeRecaptcha("submit_contact");
      console.log("reCAPTCHA トークン:", token); 
      if (!token) {
        setSubmitError("セキュリティ検証に失敗しました。再度お試しください。");
        setIsSubmitting(false);
        return;
      }

      // 3. すべてのチェックを通過したらSSGformに送信
      await submitToSSGForm(data, token);
      
      // 4. 成功時の処理
      router.push("/contact/thanks");

    } catch (error) {
      console.error("送信エラー:", error);
      setSubmitError("送信中にエラーが発生しました。時間をおいて再度お試しください。");
      setIsSubmitting(false);
    }
  };

  // SSGformへの送信
  const submitToSSGForm = async (data, recaptchaToken) => {
    const formData = new FormData();
    
    // 基本フィールド
    formData.append("会社名", data.company || "");
    formData.append("お名前", data.name);
    formData.append("メールアドレス", data.email);
    formData.append("お問い合わせ内容", data.inquiry.join(", "));
    formData.append("お問い合わせ内容の詳細", data.detail);
    formData.append("プライバシーポリシーへの同意", data.privacy ? "同意する" : "");
    
    // セキュリティ情報（隠しフィールドとして）
    formData.append("recaptcha_token", recaptchaToken);
    formData.append("submission_time", new Date().toISOString());

    const response = await fetch("https://ssgform.com/s/zCoozyIDdoC7", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`送信失敗: ${response.status}`);
    }

    return response;
  };

  const inquiryOptions = [
    "ホームページ制作",
    "ホームページ修正",
    "ECサイト制作・修正\n",
    "その他"
  ];

  const recaptchaStatus = recaptchaLoaded
    ? "✓ セキュリティ保護が有効です"
    : "⏳ セキュリティ機能を読み込み中...";

  return (
    <>
          {/* ✅ reCAPTCHA スクリプトを限定的に読み込む */}
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
        strategy="afterInteractive"
        onLoad={() => console.log("✅ reCAPTCHA スクリプト読み込み完了")}
        onError={() => console.error("❌ reCAPTCHA スクリプト読み込み失敗")}
      />
    <form 
      ref={formRef}
      className={styles.contact__form} 
      onSubmit={handleSubmit(onSubmit)}
      noValidate // ブラウザ標準バリデーションを無効化
    >
      <div className={styles.form__contentWrap}>
        {submitError && (
          <div
            style={{
              margin: "10px 0",
              padding: "10px",
              backgroundColor: "#ffebee",
              borderRadius: "4px",
              fontSize: "14px",
              color: "#d32f2f"
            }}
          >
            <p>❌ {submitError}</p>
          </div>
        )}

        <div className={styles.form__content}>
          <label className={styles.labelName} htmlFor="company">
            会社名
          </label>
          <input
            className={styles.contact__personalInformation}
            type="text"
            id="company"
            placeholder="会社名"
            {...register("company")}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.form__content}>
          <label className={styles.labelName} htmlFor="name">
            お名前<span className={styles.required}>必須</span>
          </label>
          <input
            className={styles.contact__personalInformation}
            type="text"
            id="name"
            placeholder="お名前"
            {...register("name")}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
              {errors.name.message}
            </p>
          )}
        </div>

        <div className={styles.form__content}>
          <label className={styles.labelName} htmlFor="email">
            メールアドレス<span className={styles.required}>必須</span>
          </label>
          <input
            className={styles.contact__personalInformation}
            type="email"
            id="email"
            placeholder="Email@address"
            {...register("email")}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div className={styles.form__content}>
          <label className={styles.labelName} htmlFor="inquiry">
            お問い合わせ内容<span className={styles.required}>必須</span>
          </label>

          <div className={styles.checkboxWrap}>
            <Controller
              name="inquiry"
              control={control}
              render={({ field }) => (
                <>
                  {inquiryOptions.map((option) => (
                    <label key={option} className={styles.checkbox}>
                      <input
                        className={styles.contact__checkbox}
                        type="checkbox"
                        value={option}
                        checked={field.value.includes(option)}
                        disabled={isSubmitting}
                        onChange={(e) => {
                          const value = e.target.value;
                          const isChecked = e.target.checked;
                          
                          if (isChecked) {
                            field.onChange([...field.value, value]);
                          } else {
                            field.onChange(field.value.filter(item => item !== value));
                          }
                        }}
                      />
                      <span className={styles.custom__checkbox}></span>
                      {option}
                    </label>
                  ))}
                </>
              )}
            />
          </div>
          {errors.inquiry && (
            <p style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
              {errors.inquiry.message}
            </p>
          )}

          <textarea
            id="detail"
            placeholder="お問い合わせ内容の詳細をご記入ください"
            className={styles.contact__textarea}
            {...register("detail")}
            disabled={isSubmitting}
          />
          {errors.detail && (
            <p style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
              {errors.detail.message}
            </p>
          )}
        </div>

        <div className={styles.form__pp}>
          <label className={styles.form__ppLabel}>
            <input
              className={styles.contact__checkbox}
              type="checkbox"
              id="privacy"
              {...register("privacy")}
              disabled={isSubmitting}
            />
            <span className={styles.custom__pp}></span>{" "}
            <Link className={styles.contact__pp} href="/privacy_policy">
              プライバシーポリシーに同意する
            </Link>
          </label>
          {errors.privacy && (
            <p style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
              {errors.privacy.message}
            </p>
          )}
        </div>
        
        <div className={styles.contact__click}>
          <button
            type="submit"
            disabled={isSubmitting || !recaptchaLoaded}
            style={{
              opacity: (isSubmitting || !recaptchaLoaded) ? 0.6 : 1,
              cursor: (isSubmitting || !recaptchaLoaded) ? "not-allowed" : "pointer"
            }}
          >
            {isSubmitting ? "送信中..." : "送信する →"}
          </button>
        </div>

        <div className={styles.recaptchaHead}
          style={{
            backgroundColor: recaptchaLoaded ? "#e8f5e9" : "#fff3e0",
            border: `1px solid ${recaptchaLoaded ? "#4caf50" : "#ff9800"}`
          }}
        >
          <p style={{ margin: "0 0 5px 0", fontWeight: "500" }}>{recaptchaStatus}</p>
          <p className={styles.recaptchaText}
                 >
            このフォームは、Googleの安全確認システムを使っています。
            <br />
            より快適に安心してご利用いただくため、Googleの
            <a
              style={{ textDecoration: "underline", color: "#2F4AB2" }}
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              プライバシーポリシー
            </a>
            と
            <a
              style={{ textDecoration: "underline", color: "#2F4AB2" }}
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              利用規約
            </a>
            が適用されます。
          </p>
        </div>

        {/* ハニーポットフィールド（完全に非表示） */}
        <input
          type="text"
          {...register("website")}
          style={{ 
            position: "absolute",
            left: "-9999px",
            width: "1px",
            height: "1px",
            opacity: 0,
            tabIndex: -1
          }}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
    </form>
    </>
  );
}