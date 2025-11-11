import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Sidebar() {
  const { t } = useTranslation();
  const menu = [
    { name: t("menu.inventory"), path: "/" },
    { name: t("menu.transaction"), path: "/transaction" },
    { name: t("menu.setting"), path: "/setting" }
  ];

  return (
    <div className="sidebar">
      <h2>{t("menu.scmMenu")}</h2>
      {menu.map((m) => (
        <NavLink
          key={m.path}
          to={m.path}
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          {m.name}
        </NavLink>
      ))}
      <LanguageSwitcher /> {/* 언어 전환 */}
    </div>
  );
}
