// src/router/index.jsx
import Inventory from "../pages/Inventory";
import Transaction from "../pages/Transaction";
import Setting from "../pages/Setting";

export const routes = [
  { path: "/", element: <Inventory /> },
  { path: "/transaction", element: <Transaction /> },
  { path: "/setting", element: <Setting /> },
];
