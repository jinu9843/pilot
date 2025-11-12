import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import InventorySearch from "../components/InventorySearch";
import InventoryGrid from "../components/InventoryGrid";
import { useTranslation } from "react-i18next";

export default function Inventory() {
  const { t } = useTranslation();
  const [rowData, setRowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

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

  // ✅ 날짜 + 코드 필터
  const filterData = useCallback((date, code) => {
    let data = [...rowData];

    if (date) {
      const formatted = dayjs(date).format("YYYY-MM-DD");
      data = data.filter((item) => item.inDate === formatted);
    }

    if (code) {
      data = data.filter((item) =>
        item.itemCd.toLowerCase().includes(code.toLowerCase())
      );
    }

    setFilteredData(data);
  }, [rowData]);

  // ✅ 자식에서 호출할 함수
  const handleFilterChange = (date, code) => {
    filterData(date, code);
  };

  const handleReset = () => {
    setFilteredData(rowData);
  };

  return (
    <div>
      <h1>{t("title.inventory")}</h1>
      {/* 자식에게 필터 관련 props 전달 */}
      <InventorySearch onFilterChange={handleFilterChange} onReset={handleReset} />
      <InventoryGrid rowData={filteredData} />
    </div>
  );
}
