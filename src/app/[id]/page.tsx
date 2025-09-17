"use client";

import React, { useEffect, useCallback } from "react";
import { Layout, Button, Select, Form, Spin } from "antd";
import {
  RollbackOutlined,
  CaretDownOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { TabsComponent, QuillEditor } from "@/features/news/components";
import { STATUS_MAP } from "@/features/news/constants/statusMap";
import { useNewsEditor } from "@/features/news/hooks/state/useNewsEditor";

const { Header, Sider, Content } = Layout;

interface FormValues {
  title: string;
  // intro?: string;
  content: string;
  dateRange: [any, any];
  status: string;
}

export default function EditNews({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form] = Form.useForm();

  // Hook consolidado que maneja toda la lógica de edición
  const newsEditor = useNewsEditor({
    id: params.id,
    enableNotifications: true,
    onSuccessRedirect: null,
  });

  // Auto-sincronización del formulario cuando se cargan los datos
  useEffect(() => {
    newsEditor.operations.syncFormWithData(form);
  }, [newsEditor.operations, form]);

  // Manejador de envío del formulario
  const handleFinish = useCallback(
    async (values: FormValues) => {
      try {
        await newsEditor.operations.updateNews(values);
      } catch (error) {
        console.error("Error updating news:", error);
      }
    },
    [newsEditor.operations]
  );

  // Manejador de errores de validación del formulario
  const handleFinishFailed = useCallback(
    ({
      errorFields,
    }: {
      errorFields: { name: (string | number)[]; errors: string[] }[];
    }) => {
      // Mostrar errores de validación del formulario
    },
    []
  );

  // Manejador de cambios en el QuillEditor
  const handleContentChange = useCallback(
    (content: string) => {
      form.setFieldsValue({ content });
    },
    [form]
  );

  return (
    <Layout className="flex flex-col">
      {/* Context holder para notificaciones */}
      {newsEditor.contextHolder}

      {/* Spinners de loading */}
      <Spin spinning={newsEditor.loading.updating} size="large" fullscreen />
      <Spin spinning={newsEditor.loading.fetching} size="large" fullscreen />

      <Form
        form={form}
        onFinish={handleFinish}
        onFinishFailed={handleFinishFailed}
        layout="vertical"
        className="flex flex-1 h-full"
      >
        <Layout style={{ minHeight: "90vh" }}>
          <Header className="bg-white! flex justify-between items-center px-6 py-4">
            <div className="flex items-center">
              <Button
                icon={<RollbackOutlined />}
                type="link"
                size="large"
                onClick={router.back}
              />
              <h1 className="text-black font-bold text-lg ml-4">
                Editar Noticia
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Form.Item name="status" style={{ marginBottom: 0 }}>
                <Select
                  placeholder="Seleccionar estado"
                  suffixIcon={<CaretDownOutlined />}
                  options={Object.entries(STATUS_MAP).map(
                    ([key, { text }]) => ({
                      label: text,
                      value: key,
                    })
                  )}
                />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                shape="round"
                icon={<SaveOutlined />}
                size="large"
                loading={newsEditor.loading.updating}
                disabled={
                  newsEditor.loading.updating || newsEditor.loading.fetching
                }
              >
                Guardar
              </Button>
            </div>
          </Header>

          <Content className="flex-1 pr-4 pt-4">
            <div className="flex flex-col h-full">
              <Form.Item
                name="content"
                className="bg-white rounded-lg p-4! flex-1 flex flex-col mb-0!"
              >
                <QuillEditor
                  value={form.getFieldValue("content") || ""}
                  onChange={handleContentChange}
                  height="calc(100vh - 250px)"
                />
              </Form.Item>
            </div>
          </Content>
        </Layout>

        <Sider theme="light" width={400}>
          <TabsComponent form={form} />
        </Sider>
      </Form>
    </Layout>
  );
}
