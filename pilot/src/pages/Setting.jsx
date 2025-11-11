import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Setting() {
  const { t } = useTranslation();
  const [config, setConfig] = useState({
    theme: t("setting.themeLight"),
    language: t("button.ko"),
    autoRefresh: true,
  });

  return (
    <div>
      <h1>{t("title.setting")}</h1>
      <table className="grid-table">
        <tbody>
          <tr>
            <td>{t("setting.theme")}</td>
            <td>
              <select
                value={config.theme}
                onChange={(e) => setConfig({ ...config, theme: e.target.value })}
              >
                <option>{t("setting.themeLight")}</option>
                <option>{t("setting.themeDark")}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>{t("label.language")}</td>
            <td>
              <select
                value={config.language}
                onChange={(e) => setConfig({ ...config, language: e.target.value })}
              >
                <option>{t("button.ko")}</option>
                <option>{t("button.en")}</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>{t("setting.autoRefresh")}</td>
            <td>
              <input
                type="checkbox"
                checked={config.autoRefresh}
                onChange={(e) =>
                  setConfig({ ...config, autoRefresh: e.target.checked })
                }
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
