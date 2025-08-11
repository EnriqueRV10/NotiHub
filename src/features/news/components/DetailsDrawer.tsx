import { Drawer, Button, Space, Table, TableColumnsType, message } from "antd";
import { useSingleNews } from "@/features/news/hooks/useSingleNews";
import React, { useEffect } from "react";
import { writeFile, utils } from "xlsx";

interface DrawerComponentProps {
  visible: boolean;
  onClose: () => void;
  newsId: string;
}

export interface DetailsType {
  key: string;
  code: String;
  user: string;
  read: number;
  date: string;
}

export interface ExpandedDetailsType {
  key: string;
  date: string;
}

export const DetailsDrawer = ({
  visible,
  onClose,
  newsId,
}: DrawerComponentProps) => {
  // Hook para obtener la informacion de una noticia
  const { data, error, isLoading } = useSingleNews({
    id: newsId,
  });
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (error) {
      messageApi.error({
        content:
          "Error al cargar la información de lecturas. Por favor, intente nuevamente.",
        duration: 5,
      });
    }
  }, [error, messageApi]);

  // Función para generar el archivo Excel
  const generateExcel = () => {
    if (!data || !data.data.read || data.data.read.length === 0) {
      messageApi.warning({
        content: "No hay datos disponibles para exportar.",
        duration: 5,
      });
      return;
    }

    const sortedData = data.data.read.sort(
      (a: { created: string }, b: { created: string }) =>
        new Date(a.created).getTime() - new Date(b.created).getTime()
    );

    const formattedData = sortedData.map(
      ({
        actor__code,
        actor__full_name,
        created,
      }: {
        actor__code: string;
        actor__full_name: string;
        created: string;
      }) => ({
        código: actor__code,
        empleado: actor__full_name,
        fecha: new Date(created).toLocaleString("es-MX", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      })
    );

    const ws = utils.json_to_sheet(formattedData);

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Usuarios");

    // timestamp único
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, "").slice(0, 15);

    // titulo formateado
    const title = data.data.title
      .replace(/[^a-z0-9]/gi, "-") // Reemplaza caracteres no alfanuméricos con guiones
      .replace(/-+/g, "-") // Reemplaza múltiples guiones con uno solo
      .replace(/^-|-$/g, "") // Elimina guiones al inicio y al final
      .toLowerCase();

    // nombre del archivo
    const fileName = `reporte_lecturas_${title}_${timestamp}.xlsx`;

    try {
      writeFile(wb, fileName);
      messageApi.success({
        content: "Archivo Excel generado con éxito.",
        duration: 5,
      });
    } catch (err: any) {
      messageApi.error({
        content:
          "Error al generar el archivo Excel. Por favor, inténtelo de nuevo.",
        duration: 5,
      });
    }
  };

  const processReadData = () => {
    // Se usa Set para encontrar usuarios únicos
    const usersSet = new Set<string>(); // Para almacenar solo los nombres únicos
    const usersData: {
      [key: string]: {
        code: string;
        user: string;
        read: number;
        dates: string[];
      };
    } = {};

    if (data && data.data.read) {
      // Verificar si 'read' está presente
      data.data.read.forEach((entry: any) => {
        const { actor__code, actor__full_name, created } = entry;
        if (!usersSet.has(actor__full_name)) {
          usersSet.add(actor__full_name); // Agregar usuario único al Set
          usersData[actor__full_name] = {
            code: actor__code,
            user: actor__full_name,
            read: 0,
            dates: [],
          };
        }
        // Incrementar el número de lecturas y agregar la fecha
        usersData[actor__full_name].read += 1;
        usersData[actor__full_name].dates.push(created);
      });
    }

    const detailsData = Object.values(usersData).map((user) => ({
      key: user.user,
      code: user.code,
      user: user.user,
      read: user.read,
      date: user.dates[0], // Mostrar solo la primera fecha en la tabla principal
    }));

    return { detailsData, usersData };
  };

  const { detailsData, usersData } = processReadData();

  // Tabla expandida con las fechas de lectura
  const expandedRowRender = (record: DetailsType) => {
    const columns: TableColumnsType<ExpandedDetailsType> = [
      {
        title: "Fecha",
        dataIndex: "date",
        key: "date",
        render: (date: string) =>
          new Date(date).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }), // Mostrar solo la fecha
      },
      {
        title: "Hora",
        dataIndex: "date",
        key: "time",
        render: (date: string) => new Date(date).toLocaleTimeString(), // Mostrar solo la hora
      },
    ];

    const expandedData =
      usersData[record.user]?.dates.map((date) => ({
        key: date,
        date,
      })) || []; // Verifica si existen datos para el usuario

    return (
      <Table
        columns={columns}
        dataSource={expandedData}
        pagination={false}
        size="small"
        rowHoverable={false}
      />
    );
  };

  const columns: TableColumnsType<DetailsType> = [
    { title: "Código", dataIndex: "code", key: "code" },
    {
      title: "Usuario",
      dataIndex: "user",
      key: "user",
      sorter: (a, b) => a.user.localeCompare(b.user),
      showSorterTooltip: false,
    },
    {
      title: "No. de lecturas",
      dataIndex: "read",
      key: "read",
      align: "center",
    },
    {
      title: "Fecha",
      dataIndex: "date",
      key: "date",
      render: (date: string) =>
        new Date(date).toLocaleDateString("es-MX", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }), // Mostrar solo la fecha
    },
  ];

  return (
    <>
      {contextHolder}
      <Drawer
        title={`Lecturas por Usuario`}
        placement="right"
        size={"large"}
        onClose={onClose}
        open={visible}
        extra={
          <Space>
            <Button type="primary" shape="round" onClick={generateExcel}>
              Generar Reporte
            </Button>
          </Space>
        }
        loading={isLoading}
      >
        {data && data.data.read ? ( // Renderizar solo si 'read' está disponible
          <Table
            columns={columns}
            expandable={{ expandedRowRender }}
            dataSource={detailsData}
            pagination={false}
            size="middle"
            rowHoverable={false}
          />
        ) : (
          <p>No hay datos de lectura disponibles.</p> // Mostrar un mensaje si no hay datos
        )}
      </Drawer>
    </>
  );
};
