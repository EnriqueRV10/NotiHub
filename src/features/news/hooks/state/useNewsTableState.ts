import { useState, useCallback, useMemo } from "react";
import { TablePaginationConfig } from "antd";
import {
  NewsTableState,
  NewsTableActions,
  NewsTableFilters,
  DrawersState,
  SelectionState,
  NewsTablePagination,
} from "@/features/news/types/ui";
import { NewsListItem } from "../../types/newsTypes";
import { TABLE_CONFIG } from "../../constants/tableConfig";

const initialPagination: NewsTablePagination = {
  current: 1,
  pageSize: TABLE_CONFIG.defaultPageSize,
  total: 0,
};

const initialFilters: NewsTableFilters = {
  search: "",
  status: null,
};

const initialDrawers: DrawersState = {
  creation: { open: false },
  details: { open: false, newsId: null },
  edit: { open: false, newsId: null },
};

const initialSelection: SelectionState = {
  selectedRowKeys: [],
  selectedRows: [],
};

export const useNewsTableState = () => {
  const [pagination, setPagination] =
    useState<NewsTablePagination>(initialPagination);
  const [filters, setFilters] = useState<NewsTableFilters>(initialFilters);
  const [drawers, setDrawers] = useState<DrawersState>(initialDrawers);
  const [selection, setSelection] = useState<SelectionState>(initialSelection);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [bulkActionLoading, setBulkActionLoading] = useState<boolean>(false);

  //Acciones para paginación
  const updatePagination = useCallback(
    (newPagination: Partial<TablePaginationConfig>) => {
      setPagination((prev) => ({
        ...prev,
        current: newPagination.current || prev.current,
        pageSize: newPagination.pageSize || prev.pageSize,
        total: newPagination.total || prev.total,
      }));
    },
    []
  );

  const resetPagination = useCallback(() => {
    setPagination(initialPagination);
  }, []);

  // Acciones de filtros
  const updateFilters = useCallback((newFilters: Partial<NewsTableFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Reset pagination cuando cambian los filtros
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    resetPagination();
  }, [resetPagination]);

  const setSearchText = useCallback(
    (text: string) => {
      updateFilters({ search: text });
    },
    [updateFilters]
  );

  const setStatusFilter = useCallback(
    (status: number | null) => {
      updateFilters({ status });
    },
    [updateFilters]
  );

  // Acciones de drawers
  const openCreationDrawer = useCallback(() => {
    setDrawers((prev) => ({
      ...prev,
      creation: { open: true },
    }));
  }, []);

  const closeCreationDrawer = useCallback(() => {
    setDrawers((prev) => ({
      ...prev,
      creation: { open: false },
    }));
  }, []);

  const openDetailsDrawer = useCallback((newsId: string) => {
    setDrawers((prev) => ({
      ...prev,
      details: { open: true, newsId },
    }));
  }, []);

  const closeDetailsDrawer = useCallback(() => {
    setDrawers((prev) => ({
      ...prev,
      details: { open: false, newsId: null },
    }));
  }, []);

  const openEditDrawer = useCallback((newsId: string) => {
    setDrawers((prev) => ({
      ...prev,
      edit: { open: true, newsId },
    }));
  }, []);

  const closeEditDrawer = useCallback(() => {
    setDrawers((prev) => ({
      ...prev,
      edit: { open: false, newsId: null },
    }));
  }, []);

  // Acciones de selección
  const setSelectedRows = useCallback(
    (keys: string[], rows: NewsListItem[]) => {
      setSelection({ selectedRowKeys: keys, selectedRows: rows });
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelection(initialSelection);
  }, []);

  // Estado consolidado
  const state: NewsTableState = useMemo(
    () => ({
      pagination,
      filters,
      drawers,
      selection,
      ui: {
        isRefreshing,
        bulkActionLoading,
      },
    }),
    [pagination, filters, drawers, selection, isRefreshing, bulkActionLoading]
  );

  // Acciones consolidadas
  const actions: NewsTableActions = useMemo(
    () => ({
      pagination: {
        update: updatePagination,
        reset: resetPagination,
      },
      filters: {
        update: updateFilters,
        clear: clearFilters,
        setSearch: setSearchText,
        setStatus: setStatusFilter,
      },
      drawers: {
        openCreation: openCreationDrawer,
        closeCreation: closeCreationDrawer,
        openDetails: openDetailsDrawer,
        closeDetails: closeDetailsDrawer,
        openEdit: openEditDrawer,
        closeEdit: closeEditDrawer,
      },
      selection: {
        setSelected: setSelectedRows,
        clear: clearSelection,
      },
      ui: {
        setRefreshing: setIsRefreshing,
        setBulkLoading: setBulkActionLoading,
      },
    }),
    [
      updatePagination,
      resetPagination,
      updateFilters,
      clearFilters,
      setSearchText,
      setStatusFilter,
      openCreationDrawer,
      closeCreationDrawer,
      openDetailsDrawer,
      closeDetailsDrawer,
      openEditDrawer,
      closeEditDrawer,
      setSelectedRows,
      clearSelection,
    ]
  );

  return {
    state,
    actions,
  };
};
