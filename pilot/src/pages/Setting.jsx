import { useState } from "react";

export default function Setting() {
  const [config, setConfig] = useState({
    theme: "라이트",
    language: "한국어",
    autoRefresh: true,
  });

  return (
    <div>
      <h1>시스템 설정</h1>
      <table className="grid-table">
        <tbody>
          <tr>
            <td>테마</td>
            <td>
              <select
                value={config.theme}
                onChange={(e) => setConfig({ ...config, theme: e.target.value })}
              >
                <option>라이트</option>
                <option>다크</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>언어</td>
            <td>
              <select
                value={config.language}
                onChange={(e) => setConfig({ ...config, language: e.target.value })}
              >
                <option>한국어</option>
                <option>영어</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>자동 새로고침</td>
            <td>
              <input
                type="checkbox"
                checked={config.autoRefresh}
                onChange={(e) => setConfig({ ...config, autoRefresh: e.target.checked })}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
