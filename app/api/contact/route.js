import { NextResponse } from 'next/server';

console.log('環境変数チェック:');
console.log('RECAPTCHA_SECRET_KEY:', process.env.RECAPTCHA_SECRET_KEY ? '設定あり' : '設定なし');
console.log('NEXT_PUBLIC_RECAPTCHA_SITE_KEY:', process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? '設定あり' : '設定なし');

export async function POST(request) {
  try {
    const data = await request.json();
    const recaptchaToken = data.token;
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { success: false, message: "サーバー設定エラーが発生しました" },
        { status: 500 }
      );
    }

    const params = new URLSearchParams();
    params.append("secret", secretKey);
    params.append("response", recaptchaToken);

    const recaptchaResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const recaptchaResult = await recaptchaResponse.json();

    // ✅ スコアと全体をログ出力（順番注意）
    console.log("reCAPTCHA 検証成功：score =", recaptchaResult.score);
    console.log("reCAPTCHA 検証結果の全体:", recaptchaResult);
    //☝️セキュリティー上、スコアはブラウザに出していない（ターミナル出力のみ）

    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      return NextResponse.json(
        { success: false, message: "reCAPTCHAの検証に失敗しました" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      score: recaptchaResult.score,
      message: "reCAPTCHA検証に成功しました"
    });

  } catch (error) {
    console.error('❌ サーバーエラー:', error);
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
