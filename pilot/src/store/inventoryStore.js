import { create } from "zustand";
import dayjs from "dayjs";

const useInventoryStore = create((set) => ({
  selectedDate: null,
  searchCode: "",
  filteredData: [],
  rowData: [],
  setRowData: (data) => set({ rowData: data, filteredData: data }),
  setFilteredData: (data) => set({ filteredData: data }),
  setFilters: (date, code) => set({ selectedDate: date, searchCode: code }),
  resetFilters: () => set({ selectedDate: null, searchCode: "", filteredData: [] }),
  filterData: () =>
    set((state) => {
      let data = [...state.rowData];
      if (state.selectedDate) {
        const formatted = dayjs(state.selectedDate).format("YYYY-MM-DD");
        data = data.filter((item) => item.inDate === formatted);
      }
      if (state.searchCode) {
        data = data.filter((item) =>
          item.itemCd.toLowerCase().includes(state.searchCode.toLowerCase())
        );
      }
      return { filteredData: data };
    }),
}));

export default useInventoryStore;
