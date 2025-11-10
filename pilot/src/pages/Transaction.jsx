import { useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";


export default function Transaction() {
  const [rows, setRows] = useState([]);

  const columns = useMemo(
    () => [
      { headerName: "거래번호", field: "txnNo", sortable: true },
      { headerName: "유형", field: "type", filter: true },
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
    setTimeout(() => setRows(data), 400);
  }, []);

  return (
    <div>
      <h1>거래 내역</h1>
      <div className="ag-theme-alpine" style={{ height: 400 }}>
        <AgGridReact rowData={rows} columnDefs={columns} pagination={true} />
      </div>
    </div>
  );
}
