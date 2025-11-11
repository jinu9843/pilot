import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useTranslation } from "react-i18next";

export default function InventoryGrid({ rowData }) {
  const { t } = useTranslation();

  const columnDefs = [
    { headerName: t("grid.itemCd"), field: "itemCd", sortable: true, filter: true },
    { headerName: t("grid.itemNm"), field: "itemNm", flex: 1 },
    { headerName: t("grid.warehouse"), field: "warehouse" },
    { headerName: t("grid.qty"), field: "qty", type: "rightAligned" },
    { headerName: t("grid.unit"), field: "unit" },
    { headerName: t("grid.inDate"), field: "inDate" }
  ];

  const onRowClicked = (event) => {
    const item = event.data;
    alert(t("alert.rowInfo", { itemNm: item.itemNm, warehouse: item.warehouse, qty: item.qty }));
  };

  return (
    <div className="ag-theme-alpine" style={{ height: 400 }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        pagination={true}
        onRowClicked={onRowClicked}
      />
    </div>
  );
}
