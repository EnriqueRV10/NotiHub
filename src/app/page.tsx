"use client";

import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "antd";

import {
  useNewsQuery, // hook para obtener noticias
  useNewsCounters, // hook para obtener contadores
  useNewsTableState, // hook para manejar el estado de la tabla
  useNewsOperations, // hook para manejar operaciones de noticias
} from "@/features/news/hooks";

// Componentes separados
import {
  NewsHeader,
  StatsOverview,
  NewsFilters,
  NewsTable,
  NewsCreationDrawer,
  DetailsDrawer,
} from "@/features/news/components";

const { Header, Content } = Layout;

export interface DataType {
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

  const tableData = newsData?.results || [];

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

  return (
    <Layout className="min-h-screen!">
      {newsOperations.contextHolder}

      <Header className="bg-white!">
        <NewsHeader
          onCreateNews={handleCreateNews}
          isCreating={newsOperations.loading.create}
        />
      </Header>

      <Content className="p-6">
        {/* Estadísticas */}
        <StatsOverview
          countersData={countersData}
          isCountersLoading={isCountersLoading}
        />

        {/* Filtros */}
        <NewsFilters
          filters={tableState.state.filters}
          onFiltersChange={tableState.actions.filters.update}
          onClearFilters={tableState.actions.filters.clear}
          disabled={isNewsLoading}
        />

        {/* Tabla */}
        <NewsTable
          dataSource={tableData}
          loading={isNewsLoading}
          tableState={tableState.state.pagination}
          onChange={handleTableChange}
          handleRowClick={handleRowClick}
          handleDeleteNews={handleDeleteNews}
          handleStatsClick={handleStatsClick}
          deleteBuTtonLoading={newsOperations.loading.delete}
          deleteButtonDisabled={newsOperations.loading.delete}
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
