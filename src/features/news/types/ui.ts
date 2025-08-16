import { TablePaginationConfig } from "antd";
import { NewsListItem } from "./newsTypes";

export interface NewsTableFilters {
  search: string;
  status: number | null;
  dateRange?: [Date, Date];
}

export interface NewsTablePagination {
  current: number;
  pageSize: number;
  total: number;
}

export interface DrawersState {
  creation: {
    open: boolean;
  };
  details: {
    open: boolean;
    newsId: string | null;
  };
  edit: {
    open: boolean;
    newsId: string | null;
  };
}

export interface SelectionState {
  selectedRowKeys: string[];
  selectedRows: NewsListItem[];
}

export interface NewsTableState {
  pagination: NewsTablePagination;
  filters: NewsTableFilters;
  drawers: DrawersState;
  selection: SelectionState;
  ui: {
    isRefreshing: boolean;
    bulkActionLoading: boolean;
  };
}

export interface NewsTableActions {
  pagination: {
    update: (pagination: Partial<TablePaginationConfig>) => void;
    reset: () => void;
  };
  filters: {
    update: (filters: Partial<NewsTableFilters>) => void;
    clear: () => void;
    setSearch: (text: string) => void;
    setStatus: (status: number | null) => void;
  };
  drawers: {
    openCreation: () => void;
    closeCreation: () => void;
    openDetails: (newsId: string) => void;
    closeDetails: () => void;
    openEdit: (newsId: string) => void;
    closeEdit: () => void;
  };
  selection: {
    setSelected: (keys: string[], rows: NewsListItem[]) => void;
    clear: () => void;
  };
  ui: {
    setRefreshing: (refreshing: boolean) => void;
    setBulkLoading: (loading: boolean) => void;
  };
}
