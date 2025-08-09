"use client";
import { useEffect, useState, useRef } from 'react';

// 開発環境でのみログを表示するヘルパー関数
const devLog = (message, ...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
};

export default function useRecaptcha() {
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const didTimeout = useRef(false);

  useEffect(() => {
    const checkRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.ready && !didTimeout.current) {
        window.grecaptcha.ready(() => {
          if (!didTimeout.current) {
            devLog('✅ reCAPTCHA読み込み完了'); // 🔧 修正: 開発環境のみ
            setRecaptchaLoaded(true);
          }
        });
        return true;
      }
      return false;
    };

    if (checkRecaptcha()) return;

    const interval = setInterval(() => {
      if (checkRecaptcha()) {
        clearInterval(interval);
        clearTimeout(timeout);
      }
    }, 100);

    const timeout = setTimeout(() => {
      didTimeout.current = true;
      clearInterval(interval);
      console.error('❌ reCAPTCHAスクリプトの読み込みがタイムアウトしました'); // エラーなので本番でも出力
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const executeRecaptcha = async (action) => {
    if (!recaptchaLoaded) {
      console.error('⚠️ reCAPTCHAが読み込まれていません'); // エラーなので本番でも出力
      return null;
    }

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
      console.error('❌ reCAPTCHAサイトキーが設定されていません'); // エラーなので本番でも出力
      return null;
    }

    try {
      devLog(`reCAPTCHA実行: ${action}`); // 🔧 修正: 開発環境のみ
      const token = await window.grecaptcha.execute(siteKey, { action });
      devLog('✅ reCAPTCHAトークン取得成功'); // 🔧 修正: 開発環境のみ
      return token;
    } catch (error) {
      console.error('❌ reCAPTCHA実行エラー:', error); // エラーなので本番でも出力
      return null;
    }
  };

  return { recaptchaLoaded, executeRecaptcha };
}