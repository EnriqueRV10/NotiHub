"use client";

import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableColumnsType,
  Layout,
  Row,
  Col,
  Badge,
  Popconfirm,
  Button,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";

// Hooks consolidados
import { useNewsTableState } from "@/features/news/hooks/state/useNewsTableState";
import { useNewsOperations } from "@/features/news/hooks/state/useNewsOperations";

// Hooks de datos existentes
import { useNewsQuery } from "@/features/news/hooks/api/useNewsQuery";
import { useNewsCounters } from "@/features/news/hooks/api/useNewsCounters";

// Componentes separados
import { NewsHeader } from "@/features/news/components/layout/NewsHeader";
import { NewsFilters } from "@/features/news/components/filters/NewsFilters";
import { StatisticsCard } from "@/features/news/components/stats/StatisticsCard";
import NewsCreationDrawer from "@/features/news/components/drawers/NewsCreationDrawer";
import { DetailsDrawer } from "@/features/news/components/drawers/DetailsDrawer";

// Constantes y tipos
import { STATUS_MAP } from "@/features/news/constants/statusMap";
import {
  TABLE_CONFIG,
  COLUMN_WIDTHS,
} from "@/features/news/constants/tableConfig";

const { Header, Content } = Layout;

interface DataType {
  key: string;
  title: string;
  author: string;
  start: string;
  end: string;
  status: string;
  stats: string;
}

export default function NewsListPage() {
  const router = useRouter();

  // Hooks consolidados de estado y operaciones
  const tableState = useNewsTableState();
  const newsOperations = useNewsOperations({
    enableNotifications: true,
    autoRefresh: true,
  });

  // Hook para obtener datos de noticias
  const {
    data: newsData,
    error: errorNews,
    isLoading: isNewsLoading,
    refetch: newsQueryRefetch,
  } = useNewsQuery({
    publish_status:
      tableState.state.filters.status !== null
        ? tableState.state.filters.status
        : undefined,
    page: tableState.state.pagination.current,
    pageSize: tableState.state.pagination.pageSize,
    search: tableState.state.filters.search,
  });

  // Hook para obtener contadores
  const {
    data: countersData,
    error: errorCounters,
    isLoading: isCountersLoading,
    refetch: countersRefetch,
  } = useNewsCounters({});

  // Actualizar paginación cuando se cargan los datos
  useEffect(() => {
    if (newsData) {
      tableState.actions.pagination.update({
        total: newsData.total,
        current: newsData.currentPage,
        pageSize: newsData.pageSize,
      });
    }
  }, [newsData, tableState.actions.pagination]);

  // Manejador de errores de carga
  useEffect(() => {
    if (errorNews) {
      newsOperations.utils.handleError(
        errorNews,
        "Error al cargar las noticias. Por favor, intente de nuevo más tarde."
      );
    }
  }, [errorNews, newsOperations.utils]);

  // Manejadores de eventos
  const handleCreateNews = useCallback(() => {
    tableState.actions.drawers.openCreation();
  }, [tableState.actions.drawers]);

  const handleDeleteNews = useCallback(
    async (key: string) => {
      try {
        await newsOperations.operations.delete(key, {
          onSuccess: () => {
            newsQueryRefetch();
            countersRefetch();
          },
        });
      } catch (error) {
        // Error ya manejado por newsOperations
      }
    },
    [newsOperations.operations, newsQueryRefetch, countersRefetch]
  );

  const handleTableChange = useCallback(
    (paginationInfo: any) => {
      tableState.actions.pagination.update(paginationInfo);
    },
    [tableState.actions.pagination]
  );

  const handleRowClick = useCallback(
    (record: DataType) => {
      router.push(`/${record.key}`);
    },
    [router]
  );

  const handleStatsClick = useCallback(
    (record: DataType) => {
      tableState.actions.drawers.openDetails(record.key);
    },
    [tableState.actions.drawers]
  );

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
            loading={newsOperations.loading.delete}
            disabled={newsOperations.loading.delete}
            size="small"
          />
        </Popconfirm>
      ),
    },
  ];

  const tableData = newsData?.results || [];

  return (
    <Layout className="!min-h-screen">
      {newsOperations.contextHolder}

      <Header className="!bg-white">
        <NewsHeader
          onCreateNews={handleCreateNews}
          isCreating={newsOperations.loading.create}
        />
      </Header>

      <Content className="p-6">
        {/* Estadísticas */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <StatisticsCard
              title="Total"
              value={countersData?.total || 0}
              loading={isCountersLoading}
              color="#1890ff"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatisticsCard
              title="Publicadas"
              value={countersData?.published || 0}
              loading={isCountersLoading}
              color="#52c41a"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatisticsCard
              title="Preview"
              value={countersData?.preview || 0}
              loading={isCountersLoading}
              color="#faad14"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatisticsCard
              title="Borradores"
              value={countersData?.draft || 0}
              loading={isCountersLoading}
              color="#8c8c8c"
            />
          </Col>
        </Row>

        {/* Filtros */}
        <NewsFilters
          filters={tableState.state.filters}
          onFiltersChange={tableState.actions.filters.update}
          onClearFilters={tableState.actions.filters.clear}
          disabled={isNewsLoading}
        />

        {/* Tabla */}
        <Table
          columns={columns}
          dataSource={tableData}
          loading={isNewsLoading}
          pagination={{
            current: tableState.state.pagination.current,
            pageSize: tableState.state.pagination.pageSize,
            total: tableState.state.pagination.total,
            showSizeChanger: TABLE_CONFIG.showSizeChanger,
            showQuickJumper: TABLE_CONFIG.showQuickJumper,
            showTotal: TABLE_CONFIG.showTotal,
            pageSizeOptions: TABLE_CONFIG.pageSizeOptions,
          }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
          size="middle"
          rowKey="key"
        />
      </Content>

      {/* Drawers */}
      <NewsCreationDrawer
        visible={tableState.state.drawers.creation.open}
        onClose={tableState.actions.drawers.closeCreation}
      />

      <DetailsDrawer
        visible={tableState.state.drawers.details.open}
        onClose={tableState.actions.drawers.closeDetails}
        newsId={tableState.state.drawers.details.newsId || ""}
      />
    </Layout>
  );
}
