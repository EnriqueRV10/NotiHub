"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Table,
  TableColumnsType,
  Layout,
  Col,
  Row,
  Badge,
  MenuProps,
  Dropdown,
  Input,
  message,
  Popconfirm,
} from "antd";
import { PlusOutlined, FilterFilled, DeleteOutlined } from "@ant-design/icons";
import type { GetProps } from "antd";
import { useNewsQuery } from "@/features/news/hooks/useNewsQuery";
import { useNewsCounters } from "@/features/news/hooks/useNewsCounters";
import { TablePaginationConfig } from "antd";
import { StatisticsCard } from "@/features/news/components/StatisticsCard";
import NewsCreationDrawer from "@/features/news/components/NewsCreationDrawer";
import { DetailsDrawer } from "@/features/news/components/DetailsDrawer";
import { useDeleteNews } from "@/features/news/hooks/useDeleteNews";

interface DataType {
  key: string;
  title: string;
  author: string;
  start: string;
  end: string;
  status: string;
  stats: string;
}

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Borrador", color: "grey" },
  1: { text: "Preview", color: "orange" },
  2: { text: "Publicado", color: "green" },
};

const { Header, Footer, Sider, Content } = Layout;
const { Search } = Input;

const filterOptions = Object.entries(statusMap).map(([key, { text }]) => ({
  key,
  label: text,
}));

export default function Home() {
  const columns: TableColumnsType<DataType> = [
    {
      title: "Título",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <a onClick={() => router.push(`/${record.key}`)}>{text}</a>
      ),
    },
    {
      title: "Creado por",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "Inicio",
      dataIndex: "start",
      key: "start",
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
      render: (status: number) => {
        const { text, color } = statusMap[status] || {
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
      render: (text, record) => (
        <a onClick={() => showReadDrawer(record.key)}>{text}</a>
      ),
      align: "center",
      width: 200,
    },
    {
      key: "action",
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="¿Estás seguro de eliminar esta noticia?"
          onConfirm={() => handleDelete(record.key)}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deleteNewsMutation.isPending}
            disabled={deleteNewsMutation.isPending}
          />
        </Popconfirm>
      ),
    },
  ];

  const [open, setOpen] = useState(false); // Estado para controlar si el Drawer
  const [openDetails, setOpenDetails] = useState(false); // Estado para controlar Drawer de detalles sobre lecturas
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null); // Estado para almacenar el ID de la noticia seleccionada
  const [selectedFilter, setSelectedFilter] = useState<number>(-1); // Estado para almacenar el filtro seleccionado
  const [buttonText, setButtonText] = useState<string>(
    statusMap[-1]?.text || "Todas"
  ); // Estado para almacenar el texto del botón
  const [searchText, setSearchText] = useState<string>("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [messageApi, contextHolder] = message.useMessage();

  // Hook para eliminar noticias
  const deleteNewsMutation = useDeleteNews();

  // Hook para obtener las noticias con paginación
  const {
    data: newsData,
    error: errorNews,
    isLoading: isNewsLoading,
    refetch: newsQueryRefetch,
  } = useNewsQuery({
    publish_status: selectedFilter !== -1 ? selectedFilter : undefined,
    page: pagination.current,
    pageSize: pagination.pageSize,
    search: searchText,
  });

  // Hook para obtener los contadores de noticias
  const {
    data: countersData,
    error: errorCounters,
    isLoading: isCountersLoading,
    refetch: countersRefetch,
  } = useNewsCounters({});

  // Actualiza el estado de paginación cuando se cargan los datos
  useEffect(() => {
    if (newsData) {
      setPagination((prev) => ({
        ...prev,
        total: newsData.total,
        current: newsData.currentPage,
        pageSize: newsData.pageSize,
      }));
    }
  }, [newsData]);

  useEffect(() => {
    if (errorNews) {
      messageApi.error({
        content:
          "Error al cargar las noticias. Por favor, intente de nuevo más tarde.",
        duration: 5,
      });
    }
  }, [errorNews, messageApi]);

  const router = useRouter();

  // Función para abrir el drawer de creación de noticias
  const showDrawer = () => {
    setOpen(true);
  };

  // Función para cerrar el drawer de creación de noticias
  const onClose = () => {
    setOpen(false);
  };

  // Función para abrir el drawer de detalles con el ID de la noticia seleccionada
  const showReadDrawer = (id: string) => {
    setSelectedNewsId(id); // Almacena el ID de la noticia seleccionada
    setOpenDetails(true);
  };

  // Función para cerrar el drawer de detalles
  const onCloseReadDrawer = () => {
    setOpenDetails(false);
    setTimeout(() => setSelectedNewsId(null), 300); // Limpia el ID seleccionado
  };

  // Función para manejar el click en el menú desplegable
  const handleMenuClick = (e: { key: string }) => {
    const filterKey = parseInt(e.key);
    setSelectedFilter(filterKey);
    setButtonText(statusMap[filterKey]?.text || "Todas");
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const handleDelete = (key: string) => {
    deleteNewsMutation.mutate(key, {
      onSuccess: () => {
        messageApi.success({
          content: `Noticia eliminada`,
        });
        newsQueryRefetch();
        countersRefetch();
      },
      onError: (error) => {
        messageApi.error({
          content: "Error al eliminar la noticia",
        });
      },
    });
  };

  // Opciones del menú desplegable
  const items: MenuProps["items"] = [
    {
      key: "-1",
      label: "Todas",
      onClick: handleMenuClick,
    },
    ...filterOptions.map((option) => ({
      key: option.key,
      label: option.label,
      onClick: handleMenuClick,
    })),
  ];

  // Tipo de las propiedades del componente Search
  type SearchProps = GetProps<typeof Input.Search>;

  // Función para realizar la búsqueda
  const onSearch: SearchProps["onSearch"] = (value) => {
    setSearchText(value);
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  // Función para limpiar el campo de búsqueda
  const onClear = () => {
    setSearchText("");
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const tableData = newsData?.results || []; // Datos de la tabla

  // Función para manejar el cambio de página en la tabla
  const handleTableChange = (paginationInfo: TablePaginationConfig) => {
    setPagination({
      ...pagination,
      current: paginationInfo.current || 1,
      pageSize: paginationInfo.pageSize || 10,
    });
  };

  return (
    <Layout className="!min-h-screen">
      {contextHolder}
      <Header className="!bg-white">
        <div className="flex justify-between items-center mt-4 flex-row">
          <h1 className="text-black font-bold text-lg">Noticias</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showDrawer}
            shape="round"
          >
            Nueva Noticia
          </Button>
          <NewsCreationDrawer visible={open} onClose={onClose} />
        </div>
      </Header>
      <Layout>
        <Content>
          <div className="mx-6 mt-6 md:mx-40 sm:mx-20">
            <Row gutter={[16, 16]}>
              <Col span={8} xs={24} sm={24} md={8} lg={8} xl={8}>
                <StatisticsCard
                  title="Publicadas"
                  value={countersData?.published || 0}
                  color="#3f8600"
                  loading={isCountersLoading}
                />
              </Col>
              <Col span={8} xs={24} sm={24} md={8} lg={8} xl={8}>
                <StatisticsCard
                  title="Caducadas"
                  value={countersData?.due || 0}
                  color="#cf1322"
                  loading={isCountersLoading}
                />
              </Col>
              <Col span={8} xs={24} sm={24} md={8} lg={8} xl={8}>
                <StatisticsCard
                  title="Borradores"
                  value={countersData?.draft || 0}
                  color="#6b6b6b"
                  loading={isCountersLoading}
                />
              </Col>
            </Row>
          </div>
          <div className="m-6">
            <div className="mb-3 flex justify-between">
              <Search
                placeholder="Buscar por título"
                style={{ width: 400 }}
                onSearch={onSearch}
                allowClear
                onClear={onClear}
              />
              <Dropdown
                menu={{ items, selectable: true, defaultSelectedKeys: ["-1"] }}
                placement="bottomLeft"
                trigger={["click"]}
              >
                <Button icon={<FilterFilled />} iconPosition="end">
                  {buttonText}
                </Button>
              </Dropdown>
            </div>
            <Table
              columns={columns}
              dataSource={tableData}
              size="middle"
              loading={isNewsLoading}
              pagination={{
                position: ["bottomCenter"],
                total: pagination.total,
                current: pagination.current || 1,
                pageSize: pagination.pageSize || 10,
              }}
              locale={{
                emptyText: "No hay Noticias",
              }}
              scroll={{ x: 600 }}
              onChange={handleTableChange}
            />
            {selectedNewsId && (
              <DetailsDrawer
                visible={openDetails}
                onClose={onCloseReadDrawer}
                newsId={selectedNewsId}
              />
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
