import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 로컬 JSON 리소스 import 방식 (네트워크 불필요)
import ko from "./locales/ko/translation.json";
import en from "./locales/en/translation.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en }
    },
    lng: "ko",            // 기본 언어
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
