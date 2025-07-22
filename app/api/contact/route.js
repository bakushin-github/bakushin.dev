import { NextResponse } from 'next/server';
console.log('環境変数チェック:');
console.log('RECAPTCHA_SECRET_KEY:', process.env.RECAPTCHA_SECRET_KEY ? '設定あり' : '設定なし');
console.log('NEXT_PUBLIC_RECAPTCHA_SITE_KEY:', process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? '設定あり' : '設定なし');

export async function POST(request) {
  try {
    const data = await request.json();
    
    // reCAPTCHAトークンの検証
    const recaptchaToken = data.recaptchaToken;
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    // secretKeyが設定されているか確認
    if (!secretKey) {
      return NextResponse.json(
        { success: false, message: "サーバー設定エラーが発生しました" },
        { status: 500 }
      );
    }

    // reCAPTCHAの検証
    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`,
      { method: "POST" }
    );
    
    const recaptchaResult = await recaptchaResponse.json();
    
    if (!recaptchaResult.success) {
      return NextResponse.json(
        { success: false, message: "reCAPTCHAの検証に失敗しました" },
        { status: 400 }
      );
    }

    // ここにメール送信などの処理を追加

    return NextResponse.json({ success: true, message: "メッセージを送信しました" });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, message: "サーバー側でエラーが発生しました" },
      { status: 500 }
    );
  }
}