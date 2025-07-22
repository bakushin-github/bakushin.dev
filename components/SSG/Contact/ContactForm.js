"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(1, "お名前は必須です"),
  email: z.string().email("正しいメールアドレスを入力してください"),
  message: z.string().min(1, "お問い合わせ内容を入力してください"),
  service: z.string().min(1, "サービスを選択してください"),
  privacy: z.literal(true, { errorMap: () => ({ message: "同意が必要です" }) }),
  honey: z.string().max(0), // honeypot
});

export default function ContactForm() {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    const token = await grecaptcha.execute("あなたのreCAPTCHAサイトキー", { action: "submit" });

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, token }),
    });

    if (res.ok) setSuccess(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="お名前" {...register("name")} />
      <p>{errors.name?.message}</p>

      <input type="email" placeholder="メールアドレス" {...register("email")} />
      <p>{errors.email?.message}</p>

      <select {...register("service")}>
        <option value="">選択してください</option>
        <option value="制作">制作</option>
        <option value="修正">修正</option>
      </select>
      <p>{errors.service?.message}</p>

      <textarea placeholder="お問い合わせ内容" {...register("message")} />
      <p>{errors.message?.message}</p>

      <label>
        <input type="checkbox" {...register("privacy")} />
        プライバシーポリシーに同意する
      </label>
      <p>{errors.privacy?.message}</p>

      {/* honeypot */}
      <input type="text" {...register("honey")} className="hidden" autoComplete="off" />

      <button type="submit" disabled={isSubmitting}>送信</button>

      {success && <p>送信が完了しました。</p>}
    </form>
  );
}
