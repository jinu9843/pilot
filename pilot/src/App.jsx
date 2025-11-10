import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { routes } from "./router";

export default function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="content">
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </div>
    </div>
  );
}
