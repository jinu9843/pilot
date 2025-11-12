import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export default function Transaction() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTxn, setSearchTxn] = useState(""); // 거래번호
  const [searchHandler, setSearchHandler] = useState(""); // 담당자

  /* 
  🔹 useCallback 원본 (함수를 메모이제이션)
  const onRowClicked = useCallback((e) => {
    const tx = e.data;
    alert(
      t("alert.txnRowInfo", {
        txnNo: tx.txnNo,
        handler: tx.handler,
        type: tx.type,
      })
    );
  }, [t]);
  */

  // ✅ useCallback 제거 → 일반 함수로 변경
  function onRowClicked(e) {
    const tx = e.data;
    alert(
      t("alert.txnRowInfo", {
        txnNo: tx.txnNo,
        handler: tx.handler,
        type: tx.type,
      })
    );
  }

  /* 
  🔹 useCallback 원본 (검색 필터 함수)
  const filterData = useCallback(() => {
    let result = [...rows];

    if (searchTxn) {
      result = result.filter((row) =>
        row.txnNo.toLowerCase().includes(searchTxn.toLowerCase())
      );
    }

    if (searchHandler) {
      result = result.filter((row) =>
        row.handler.toLowerCase().includes(searchHandler.toLowerCase())
      );
    }

    setFiltered(result);
  }, [rows, searchTxn, searchHandler]);
  */

  // ✅ 일반 함수로 대체
  function filterData() {
    let result = [...rows];

    if (searchTxn) {
      result = result.filter((row) =>
        row.txnNo.toLowerCase().includes(searchTxn.toLowerCase())
      );
    }

    if (searchHandler) {
      result = result.filter((row) =>
        row.handler.toLowerCase().includes(searchHandler.toLowerCase())
      );
    }

    setFiltered(result);
  }

  useEffect(() => {
    filterData();
  }, [rows, searchTxn, searchHandler]); // ✅ 일반 함수 호출로 변경

  /* 
  🔹 useMemo 원본 (컬럼 정의를 메모이제이션)
  const columnDefs = useMemo(
    () => [
      { headerName: t("grid.txnNo"), field: "txnNo", sortable: true },
      { headerName: t("grid.type"), field: "type" },
      { headerName: t("grid.itemCd"), field: "itemCd" },
      { headerName: t("grid.qty"), field: "qty", type: "rightAligned" },
      { headerName: t("grid.handler"), field: "handler" },
      { headerName: t("grid.date"), field: "date" },
    ],
    [t]
  );
  */

  // ✅ useMemo 제거 → 단순 변수 선언
  const columnDefs = [
    { headerName: t("grid.txnNo"), field: "txnNo", sortable: true },
    { headerName: t("grid.type"), field: "type" },
    { headerName: t("grid.itemCd"), field: "itemCd" },
    { headerName: t("grid.qty"), field: "qty", type: "rightAligned" },
    { headerName: t("grid.handler"), field: "handler" },
    { headerName: t("grid.date"), field: "date" },
  ];

  // ✅ 더미 데이터 세팅
  useEffect(() => {
    const data = [
      { txnNo: "TX-1001", type: "입고", itemCd: "MAT-001", qty: 2000, handler: "홍길동", date: "2025-11-02" },
      { txnNo: "TX-1002", type: "출고", itemCd: "MAT-003", qty: 300, handler: "이수진", date: "2025-11-03" },
      { txnNo: "TX-1003", type: "입고", itemCd: "MAT-004", qty: 1000, handler: "김민수", date: "2025-11-04" },
      { txnNo: "TX-1004", type: "출고", itemCd: "MAT-001", qty: 500, handler: "박지현", date: "2025-11-06" },
    ];
    setRows(data);
    setFiltered(data);
  }, []);

  return (
    <div>
      <h1>{t("title.transaction")}</h1>

      {/* ✅ 검색창 */}
      <div style={{ marginBottom: 10 }}>
        🔍 {t("grid.txnNo")}:{" "}
        <input
          type="text"
          placeholder={t("placeholder.txnExample")}
          value={searchTxn}
          onChange={(e) => setSearchTxn(e.target.value)}
          style={{ padding: "5px", marginRight: "10px" }}
        />
        {t("grid.handler")}:{" "}
        <input
          type="text"
          placeholder={t("placeholder.handlerExample")}
          value={searchHandler}
          onChange={(e) => setSearchHandler(e.target.value)}
          style={{ padding: "5px" }}
        />
        <button
          style={{ marginLeft: 10 }}
          onClick={() => {
            setSearchTxn("");
            setSearchHandler("");
            setFiltered(rows);
          }}
        >
          {t("button.all")}
        </button>
      </div>

      {/* ✅ AG Grid */}
      <div className="ag-theme-alpine" style={{ height: 400 }}>
        <AgGridReact
          rowData={filtered}
          columnDefs={columnDefs}
          pagination={true}
          onRowClicked={onRowClicked}
        />
      </div>
    </div>
  );
}
