import { useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export default function Inventory() {
  const [rowData, setRowData] = useState([]);

  const columnDefs = useMemo(
    () => [
      { headerName: "품목코드", field: "itemCd", sortable: true, filter: true },
      { headerName: "품목명", field: "itemNm", flex: 1 },
      { headerName: "창고", field: "warehouse" },
      { headerName: "수량", field: "qty", type: "rightAligned" },
      { headerName: "단위", field: "unit" },
      { headerName: "입고일자", field: "inDate" },
    ],
    []
  );

  useEffect(() => {
    const mock = [
      { itemCd: "MAT-001", itemNm: "D램 웨이퍼 12인치", warehouse: "Icheon", qty: 12500, unit: "EA", inDate: "2025-11-01" },
      { itemCd: "MAT-002", itemNm: "NAND 패키지", warehouse: "Cheongju", qty: 8900, unit: "EA", inDate: "2025-11-03" },
      { itemCd: "MAT-003", itemNm: "SSD 컨트롤러", warehouse: "Wuxi", qty: 4500, unit: "EA", inDate: "2025-11-02" },
      { itemCd: "MAT-004", itemNm: "테스트 PCB", warehouse: "Icheon", qty: 2100, unit: "EA", inDate: "2025-11-05" },
    ];
    setTimeout(() => setRowData(mock), 400);
  }, []);

  return (
    <div>
      <h1>재고 현황</h1>
      <div className="ag-theme-alpine" style={{ height: 400 }}>
        <AgGridReact rowData={rowData} columnDefs={columnDefs} pagination={true} />
      </div>
    </div>
  );
}
