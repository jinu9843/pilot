import { useState, useEffect, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export default function Inventory() {
  const [rowData, setRowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchCode, setSearchCode] = useState(""); // ✅ 품목코드 검색어

  const onRowClicked = useCallback((event) => {
    const item = event.data;
    alert(`품목: ${item.itemNm}\n창고: ${item.warehouse}\n수량: ${item.qty}`);
  }, []);

  // ✅ 날짜 필터
  const handleDateChange = useCallback(
    (date) => {
      setSelectedDate(date);
      filterData(date, searchCode);
    },
    [rowData, searchCode]
  );

  // ✅ 품목코드 필터
  const handleCodeChange = useCallback(
    (e) => {
      const code = e.target.value;
      setSearchCode(code);
      filterData(selectedDate, code);
    },
    [rowData, selectedDate]
  );

  // ✅ 공통 필터 함수
  const filterData = useCallback(
    (date, code) => {
      let data = [...rowData];

      // 날짜 필터
      if (date) {
        const formatted = date.toISOString().split("T")[0];
        data = data.filter((item) => item.inDate === formatted);
      }

      // 품목코드 필터
      if (code) {
        data = data.filter((item) =>
          item.itemCd.toLowerCase().includes(code.toLowerCase())
        );
      }

      setFilteredData(data);
    },
    [rowData]
  );

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
      { itemCd: "MAT-005", itemNm: "로직칩", warehouse: "Cheongju", qty: 3100, unit: "EA", inDate: "2025-11-02" },
    ];
    setRowData(mock);
    setFilteredData(mock);
  }, []);

  return (
    <div>
      <h1>재고 현황</h1>

      {/* ✅ 검색창 구역 */}
      <div style={{ marginBottom: 10 }}>
        📅 입고일자:{" "}
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          placeholderText="날짜 선택"
          isClearable
        />
        <input
          type="text"
          placeholder="품목코드 검색"
          value={searchCode}
          onChange={handleCodeChange}
          style={{ marginLeft: 10, padding: "5px" }}
        />
        <button
          style={{ marginLeft: 10 }}
          onClick={() => {
            setSelectedDate(null);
            setSearchCode("");
            setFilteredData(rowData);
          }}
        >
          전체보기
        </button>
      </div>

      <div className="ag-theme-alpine" style={{ height: 400 }}>
        <AgGridReact
          rowData={filteredData}
          columnDefs={columnDefs}
          pagination={true}
          onRowClicked={onRowClicked}
        />
      </div>
    </div>
  );
}
