import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  console.log('APIリクエスト受信:', req.body);
  
  try {
    const { name, email, company, detail, inquiry, token, website } = req.body;

    // 必須フィールドの検証
    if (!name || !email || !inquiry.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "必須情報が不足しています"
      });
    }

    // Honeypotチェック（もし実装されていれば）
    if (website) {
      return res.status(400).json({ success: false, message: "Bot detected" });
    }

    // reCAPTCHA検証
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: "reCAPTCHAトークンが提供されていません" 
      });
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      console.error('reCAPTCHAシークレットキーが設定されていません');
      return res.status(500).json({ 
        success: false, 
        message: "サーバー設定エラーが発生しました" 
      });
    }

    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`,
      { method: "POST" }
    );
    
    const recaptchaData = await recaptchaResponse.json();
    
    if (!recaptchaData.success || recaptchaData.score < 0.5) {
      console.log('reCAPTCHA検証失敗:', recaptchaData);
      return res.status(400).json({ 
        success: false, 
        message: "reCAPTCHA検証に失敗しました" 
      });
    }

    console.log('reCAPTCHA検証成功:', recaptchaData);

    // メール送信
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // メール本文の作成
    const mailText = `
会社名: ${company || '記入なし'}
お名前: ${name}
メールアドレス: ${email}
お問い合わせ内容: ${inquiry ? inquiry.join(', ') : '選択なし'}

詳細:
${detail}
    `;

    console.log('メール送信開始:', {
      to: process.env.CONTACT_TO || '未設定',
      subject: "お問い合わせがありました",
      text: mailText
    });

    try {
      const mailResult = await transporter.sendMail({
        from: `"お問い合わせフォーム" <${process.env.SMTP_USER}>`,
        replyTo: email,
        to: process.env.CONTACT_TO, // 受信先メール
        subject: "お問い合わせがありました",
        text: mailText,
      });

      console.log('メール送信成功:', mailResult);
      return res.status(200).json({ success: true });
    } catch (mailErr) {
      console.error("メール送信エラー:", mailErr);
      return res.status(500).json({ 
        success: false, 
        message: "メール送信に失敗しました", 
        error: mailErr.message 
      });
    }
  } catch (err) {
    console.error("APIエラー:", err);
    return res.status(500).json({ 
      success: false, 
      message: "サーバーエラーが発生しました", 
      error: err.message 
    });
  }
}