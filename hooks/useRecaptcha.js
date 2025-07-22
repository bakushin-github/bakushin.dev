"use client";
import { useEffect, useState, useRef } from 'react';

export default function useRecaptcha() {
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const didTimeout = useRef(false);

  useEffect(() => {
    const checkRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.ready && !didTimeout.current) {
        window.grecaptcha.ready(() => {
          if (!didTimeout.current) {
            console.log('✅ reCAPTCHA読み込み完了');
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
      console.error('❌ reCAPTCHAスクリプトの読み込みがタイムアウトしました');
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const executeRecaptcha = async (action) => {
    if (!recaptchaLoaded) {
      console.error('⚠️ reCAPTCHAが読み込まれていません');
      return null;
    }

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
      console.error('❌ reCAPTCHAサイトキーが設定されていません');
      return null;
    }

    try {
      console.log(`reCAPTCHA実行: ${action}`);
      const token = await window.grecaptcha.execute(siteKey, { action });
      console.log('✅ reCAPTCHAトークン取得成功');
      return token;
    } catch (error) {
      console.error('❌ reCAPTCHA実行エラー:', error);
      return null;
    }
  };

  return { recaptchaLoaded, executeRecaptcha };
}
