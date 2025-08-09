import { NextResponse } from 'next/server';

// 開発環境でのみログを表示するヘルパー関数
const devLog = (message, ...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
};

// 🔧 修正: 開発環境でのみ環境変数チェック
devLog('環境変数チェック:');
devLog('RECAPTCHA_SECRET_KEY:', process.env.RECAPTCHA_SECRET_KEY ? '設定あり' : '設定なし');
devLog('NEXT_PUBLIC_RECAPTCHA_SITE_KEY:', process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? '設定あり' : '設定なし');

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

    // 🔧 修正: 開発環境でのみスコアと結果をログ出力
    devLog("reCAPTCHA 検証成功：score =", recaptchaResult.score);
    devLog("reCAPTCHA 検証結果の全体:", recaptchaResult);
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
    // 🔧 エラーログは本番環境でも重要なので保持
    console.error('❌ サーバーエラー:', error);
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}