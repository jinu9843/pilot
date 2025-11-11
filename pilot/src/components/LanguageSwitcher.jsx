import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  return (
    <div style={{ marginTop: 12 }}>
      <button onClick={() => i18n.changeLanguage("ko")} style={{ marginRight: 8 }}>
        {t("button.ko")}
      </button>
      <button onClick={() => i18n.changeLanguage("en")}>
        {t("button.en")}
      </button>
    </div>
  );
}
