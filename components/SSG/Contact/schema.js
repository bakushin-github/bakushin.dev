// // components/SSG/Contact/schema.js
// import { z } from 'zod';

// // お問い合わせフォームのスキーマ定義
// export const contactFormSchema = z.object({
//   // 氏名（必須、2文字以上50文字以内）
//   name: z
//     .string()
//     .min(2, { message: '氏名は2文字以上で入力してください' })
//     .max(50, { message: '氏名は50文字以内で入力してください' }),
    
//   // メールアドレス（必須、正しい形式）
//   email: z
//     .string()
//     .email({ message: '正しいメールアドレスを入力してください' }),
    
//   // 件名（必須、5文字以上100文字以内）
//   subject: z
//     .string()
//     .min(5, { message: '件名は5文字以上で入力してください' })
//     .max(100, { message: '件名は100文字以内で入力してください' }),
    
//   // 本文（必須、10文字以上1000文字以内）
//   message: z
//     .string()
//     .min(10, { message: 'メッセージは10文字以上で入力してください' })
//     .max(1000, { message: 'メッセージは1000文字以内で入力してください' }),
    
//   // プライバシーポリシー同意チェック（必須、trueである必要あり）
//   agreement: z
//     .boolean()
//     .refine((val) => val === true, {
//       message: 'プライバシーポリシーに同意する必要があります',
//     }),
    
//   // ハニーポット（Bot対策の隠しフィールド - 空である必要あり）
//   honeypot: z
//     .string()
//     .max(0, { message: 'Bot検出' }),
    
//   // reCAPTCHAトークン（必須）
//   recaptchaToken: z
//     .string()
//     .min(1, { message: 'reCAPTCHA認証が必要です' }),
// });

// // バリデーション用の型定義（TypeScript使用時）
// export type ContactFormValues = z.infer<typeof contactFormSchema>;