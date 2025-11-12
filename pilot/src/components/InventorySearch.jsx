import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";

export default function InventorySearch({ onFilterChange, onReset }) {
   const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchCode, setSearchCode] = useState("");

  const handleDateChange = (date) => {
    setSelectedDate(date);
    onFilterChange(date, searchCode);
  };

  const handleCodeChange = (e) => {
    const code = e.target.value;
    setSearchCode(code);
    onFilterChange(selectedDate, code);
  };

  return (
    <div style={{ marginBottom: 10 }}>
      {t("label.inDate")}:{" "}
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
       placeholderText={t("label.inDate")}
        isClearable
       portalId="root-portal"
        popperPlacement="bottom-start"
      />
      <input
        type="text"
       placeholder={t("label.itemCodeSearch")}
        value={searchCode}
        onChange={handleCodeChange}
        style={{ marginLeft: 10, padding: "5px" }}
      />
      <button style={{ marginLeft: 10 }} onClick={onReset}>
        {t("button.all")}
      </button>
    </div>
  );
}
