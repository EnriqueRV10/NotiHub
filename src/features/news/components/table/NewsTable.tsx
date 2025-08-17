import React from "react";
import { Table, TableColumnsType, Badge, Popconfirm, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { TABLE_CONFIG } from "../../constants/tableConfig";
import { COLUMN_WIDTHS } from "../../constants/tableConfig";
import { STATUS_MAP } from "../../constants/statusMap";
import { DataType } from "@/app/page";
import { NewsListItem } from "../../types/newsTypes";
import { NewsTablePagination } from "../../types/ui";

interface NewsTableProps {
  dataSource: NewsListItem[];
  loading: boolean;
  tableState: NewsTablePagination;
  onChange: any;
  handleRowClick: (record: DataType) => void;
  handleDeleteNews: (key: string) => void;
  handleStatsClick: (record: DataType) => void;
  deleteBuTtonLoading: boolean;
  deleteButtonDisabled: boolean;
}

export default function NewsTable({
  dataSource,
  loading,
  tableState,
  onChange,
  handleRowClick,
  handleDeleteNews,
  handleStatsClick,
  deleteBuTtonLoading,
  deleteButtonDisabled,
}: NewsTableProps) {
  // Configuración de columnas de la tabla
  const columns: TableColumnsType<DataType> = [
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
      width: COLUMN_WIDTHS.title,
      render: (text, record) => (
        <a onClick={() => handleRowClick(record)}>{text}</a>
      ),
    },
    {
      title: "Creado por",
      dataIndex: "author",
      key: "author",
      width: COLUMN_WIDTHS.author,
    },
    {
      title: "Inicio",
      dataIndex: "start",
      key: "start",
      width: COLUMN_WIDTHS.startDate,
      sorter: (a, b) =>
        new Date(a.start).getTime() - new Date(b.start).getTime(),
      render: (start: string) => {
        const formattedDate = new Date(start).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        return <span>{formattedDate}</span>;
      },
      showSorterTooltip: false,
    },
    {
      title: "Fin",
      dataIndex: "end",
      key: "end",
      width: COLUMN_WIDTHS.endDate,
      render: (end: string) => {
        const formattedDate = new Date(end).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        return <span>{formattedDate}</span>;
      },
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      width: COLUMN_WIDTHS.status,
      render: (status: number) => {
        const { text, color } = STATUS_MAP[status] || {
          text: "Desconocido",
          color: "gray",
        };
        return <Badge color={color} text={text} />;
      },
    },
    {
      title: "Estadísticas",
      dataIndex: "stats",
      key: "stats",
      width: COLUMN_WIDTHS.stats,
      render: (text, record) => (
        <a onClick={() => handleStatsClick(record)}>{text}</a>
      ),
      align: "center",
    },
    {
      key: "action",
      width: COLUMN_WIDTHS.actions,
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="¿Estás seguro de eliminar esta noticia?"
          onConfirm={() => handleDeleteNews(record.key)}
          okText="Sí"
          cancelText="No"
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deleteBuTtonLoading}
            disabled={deleteButtonDisabled}
            size="small"
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      pagination={{
        current: tableState.current,
        pageSize: tableState.pageSize,
        total: tableState.total,
        showSizeChanger: TABLE_CONFIG.showSizeChanger,
        showQuickJumper: TABLE_CONFIG.showQuickJumper,
        showTotal: TABLE_CONFIG.showTotal,
        pageSizeOptions: TABLE_CONFIG.pageSizeOptions,
      }}
      onChange={onChange}
      scroll={{ x: "max-content" }}
      size="middle"
      rowKey="key"
    />
  );
}
