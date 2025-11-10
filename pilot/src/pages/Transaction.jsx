import { useState, useEffect, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export default function Transaction() {
  const [rows, setRows] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTxn, setSearchTxn] = useState(""); // ✅ 거래번호
  const [searchHandler, setSearchHandler] = useState(""); // ✅ 담당자

  const onRowClicked = useCallback((e) => {
    const tx = e.data;
    alert(`거래번호: ${tx.txnNo}\n담당자: ${tx.handler}\n유형: ${tx.type}`);
  }, []);

  // ✅ 검색 로직
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

  useEffect(() => {
    filterData();
  }, [filterData]);

  const columnDefs = useMemo(
    () => [
      { headerName: "거래번호", field: "txnNo", sortable: true },
      { headerName: "유형", field: "type" },
      { headerName: "품목코드", field: "itemCd" },
      { headerName: "수량", field: "qty", type: "rightAligned" },
      { headerName: "담당자", field: "handler" },
      { headerName: "거래일자", field: "date" },
    ],
    []
  );

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
      <h1>거래 내역</h1>

      {/* ✅ 검색창 2개로 분리 */}
      <div style={{ marginBottom: 10 }}>
        🔍 거래번호:{" "}
        <input
          type="text"
          placeholder="예: TX-1001"
          value={searchTxn}
          onChange={(e) => setSearchTxn(e.target.value)}
          style={{ padding: "5px", marginRight: "10px" }}
        />
        담당자:{" "}
        <input
          type="text"
          placeholder="예: 홍길동"
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
          전체보기
        </button>
      </div>

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
