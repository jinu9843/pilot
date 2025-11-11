import { useEffect } from "react";
import useInventoryStore from "../store/inventoryStore";
import InventorySearch from "../components/InventorySearch";
import InventoryGrid from "../components/InventoryGrid";
import { useTranslation } from "react-i18next";

export default function Inventory() {
  const { t } = useTranslation();
  const {
    rowData, filteredData, setRowData, setFilteredData,
    filterData, setFilters, resetFilters
  } = useInventoryStore();

  useEffect(() => {
    if (rowData.length === 0) {
      const mock = [
        { itemCd: "MAT-001", itemNm: "D램 웨이퍼 12인치", warehouse: "Icheon", qty: 12500, unit: "EA", inDate: "2025-11-01" },
        { itemCd: "MAT-002", itemNm: "NAND 패키지", warehouse: "Cheongju", qty: 8900, unit: "EA", inDate: "2025-11-03" },
        { itemCd: "MAT-003", itemNm: "SSD 컨트롤러", warehouse: "Wuxi", qty: 4500, unit: "EA", inDate: "2025-11-02" },
        { itemCd: "MAT-004", itemNm: "테스트 PCB", warehouse: "Icheon", qty: 2100, unit: "EA", inDate: "2025-11-05" },
        { itemCd: "MAT-005", itemNm: "로직칩", warehouse: "Cheongju", qty: 3100, unit: "EA", inDate: "2025-11-02" }
      ];
      setRowData(mock);
      setFilteredData(mock);
    }
  }, [rowData]);

  const handleFilterChange = (date, code) => {
    setFilters(date, code);
    filterData();
  };

  const handleReset = () => {
    resetFilters();
    setFilteredData(rowData);
  };

  return (
    <div>
      <h1>{t("title.inventory")}</h1>
      <InventorySearch onFilterChange={handleFilterChange} onReset={handleReset} />
      <InventoryGrid rowData={filteredData} />
    </div>
  );
}
