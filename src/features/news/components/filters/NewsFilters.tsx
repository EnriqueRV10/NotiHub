import React, { useCallback } from "react";
import { Input, Dropdown, Button, Space } from "antd";
import { FilterFilled, ClearOutlined } from "@ant-design/icons";
import type { GetProps, MenuProps } from "antd";
import { NewsTableFilters } from "../../types/ui";
import {
  FILTER_OPTIONS,
  DEFAULT_STATUS_TEXT,
  STATUS_MAP,
} from "../../constants/statusMap";

const { Search } = Input;
type SearchProps = GetProps<typeof Input.Search>;

interface NewsFiltersProps {
  filters: NewsTableFilters;
  onFiltersChange: (filters: Partial<NewsTableFilters>) => void;
  onClearFilters: () => void;
  disabled?: boolean;
}

export const NewsFilters: React.FC<NewsFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  disabled = false,
}) => {
  // Texto del botón de filtro de status
  const getStatusButtonText = useCallback(() => {
    if (filters.status === null || filters.status === -1) {
      return DEFAULT_STATUS_TEXT;
    }
    return STATUS_MAP[filters.status]?.text || DEFAULT_STATUS_TEXT;
  }, [filters.status]);

  // Manejador de búsqueda
  const onSearch: SearchProps["onSearch"] = useCallback(
    (value) => {
      onFiltersChange({ search: value.trim() });
    },
    [onFiltersChange]
  );

  // Manejador de limpieza de búsqueda
  const onClear = useCallback(() => {
    onFiltersChange({ search: "" });
  }, [onFiltersChange]);

  // Manejador de click en menú de status
  const handleStatusMenuClick = useCallback(
    (e: { key: string }) => {
      const statusValue = parseInt(e.key);
      const normalizedStatus = statusValue === -1 ? null : statusValue;
      onFiltersChange({ status: normalizedStatus });
    },
    [onFiltersChange]
  );

  // Opciones del menú de status
  const statusMenuItems: MenuProps["items"] = FILTER_OPTIONS.map((option) => ({
    key: option.key,
    label: option.label,
    onClick: handleStatusMenuClick,
  }));

  // Verificar si hay filtros activos
  const hasActiveFilters =
    filters.search.length > 0 ||
    (filters.status !== null && filters.status !== -1);

  return (
    <div className="flex justify-between items-center mb-4 gap-4">
      {/* Búsqueda */}
      <div className="flex-1 max-w-md">
        <Search
          placeholder="Buscar noticias..."
          allowClear
          enterButton="Buscar"
          size="middle"
          onSearch={onSearch}
          onClear={onClear}
          defaultValue={filters.search}
          disabled={disabled}
          maxLength={100}
        />
      </div>

      {/* Filtros */}
      <Space>
        {/* Filtro de Status */}
        <Dropdown
          menu={{ items: statusMenuItems }}
          trigger={["click"]}
          disabled={disabled}
        >
          <Button icon={<FilterFilled />} size="middle">
            {getStatusButtonText()}
          </Button>
        </Dropdown>

        {/* Botón para limpiar filtros */}
        {hasActiveFilters && (
          <Button
            icon={<ClearOutlined />}
            onClick={onClearFilters}
            size="middle"
            type="text"
            disabled={disabled}
            title="Limpiar filtros"
          >
            Limpiar
          </Button>
        )}
      </Space>
    </div>
  );
};
