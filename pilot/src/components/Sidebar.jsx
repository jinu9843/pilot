import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const menu = [
    { name: "재고 현황", path: "/" },
    { name: "거래 내역", path: "/transaction" },
    { name: "시스템 설정", path: "/setting" },
  ];

  return (
    <div className="sidebar">
      <h2>📦 SCM 메뉴</h2>
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
    </div>
  );
}
