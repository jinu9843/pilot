import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { useTranslation } from "react-i18next";
import "../styles/WeekCalendar.css";

dayjs.extend(weekOfYear);

export default function InventorySearch({ onFilterChange, onReset }) {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchCode, setSearchCode] = useState("");
  const [week, setWeek] = useState(null);

  // ✅ 첫 렌더 시 오늘 날짜로 초기화
  useEffect(() => {
    const today = new Date();
    setSelectedDate(today);
    const currentWeek = dayjs(today).week();
    setWeek(currentWeek);

    // 부모에게도 초기 필터 전달
    onFilterChange(today, "");
  }, []); // 최초 1회 실행

  // ✅ 날짜 변경 시
  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      const weekNumber = dayjs(date).week();
      setWeek(weekNumber);
    } else {
      setWeek(null);
    }
    onFilterChange(date, searchCode);
  };

  // ✅ 품목코드 변경 시
  const handleCodeChange = (e) => {
    const code = e.target.value;
    setSearchCode(code);
    onFilterChange(selectedDate, code);
  };

  // ✅ 달력 내부에 주차 표시 (1주, 2주...)
  const CustomCalendarContainer = ({ children }) => {
    useEffect(() => {
      const weeks = document.querySelectorAll(".react-datepicker__week");
      weeks.forEach((weekElem, idx) => {
        weekElem.setAttribute("data-week", `${idx + 1}${t("label.week")}`);
      });

      if (selectedDate) {
        const selWeek = Math.ceil(dayjs(selectedDate).date() / 7);
        weeks.forEach((w, i) =>
          w.classList.toggle("highlight-week", i + 1 === selWeek)
        );
      }
    }, [selectedDate, t]);

    return <div className="week-calendar-container">{children}</div>;
  };

  return (
    <div style={{ marginBottom: 10 }}>
      📅 {t("label.inDate")}:{" "}
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        placeholderText={t("label.inDate")}
        isClearable
        calendarContainer={CustomCalendarContainer}
        popperPlacement="bottom-start"
        portalId="root-portal"
      />

      {/* ✅ 선택된 주차 표시 */}
      {week && (
        <span style={{ marginLeft: 10, fontWeight: "bold" }}>
          {i18n.language === "ko"
            ? `${week}${t("label.week")}`
            : `${t("label.week")} ${week}`}
        </span>
      )}

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
