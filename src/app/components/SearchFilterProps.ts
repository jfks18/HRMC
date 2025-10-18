export interface SearchFilterProps {
  search: string;
  setSearch: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  filters?: string[]; // Optional: list of filter options
  showPeriodDropdown?: boolean;
  showDateInput?: boolean;
  showExportButton?: boolean;
}
