"use client";

import React, { useEffect, useState } from "react";
import { Layout, Button, Select, Form, Spin, message } from "antd";
import {
  RollbackOutlined,
  CaretDownOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useSingleNewsEditor, useUpdateNews } from "@/features/news/hooks";
import dayjs from "dayjs";
import { TabsComponent, QuillEditor } from "@/features/news/components";

import { STATUS_MAP } from "@/features/news/constants/statusMap";

const { Header, Sider, Content } = Layout;

interface FormValues {
  title: string;
  intro: string;
  content: string;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
  status: string;
}

export default function EditNews({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form] = Form.useForm();
  const { data, error, isLoading } = useSingleNewsEditor({ id: params.id }); // Hook para obtener la informacion de una noticia (sin refreshonwindowsFocus)
  const [messageApi, contextHolder] = message.useMessage();
  const {
    mutate,
    error: updateError,
    isSuccess,
    isError,
    isPending,
  } = useUpdateNews(params.id); // Hook para actualizar la noticia

  // useEffect para actualizar los valores del formulario cuando los datos estén listos
  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        title: data.data.title,
        intro: data.data.intro,
        dateRange: [
          data.data.start_date ? dayjs(data.data.start) : null,
          data.data.end_date ? dayjs(data.data.end) : null,
        ],
        status: data.data.publish_status.toString(),
        body: data.data.content,
      });
    }
    if (error) {
      messageApi.error({
        content: "Error al cargar la noticia",
        duration: 5,
      });
    }
  }, [data, form, messageApi, error]);

  // Cuando la noticia se actualiza con éxito, muestra un mensaje
  useEffect(() => {
    if (isSuccess) {
      messageApi.success({
        content: "Noticia actualizada con éxito",
        duration: 5,
      });
    }
  }, [isSuccess, messageApi]);

  // Muestra un mensaje de error si la noticia no se actualiza correctamente
  useEffect(() => {
    if (isError) {
      messageApi.error({
        content: `Error al actualizar la noticia`,
        duration: 5,
      });
    }
  }, [isError, messageApi]);

  const handleFinish = (values: any) => {
    const currentValues = form.getFieldsValue(true);
    const payload = formToAPI(currentValues);
    console.log("Payload to submit:", payload);
    if (payload) {
      mutate(payload);
    }
  };

  const formToAPI = (values: FormValues): any | null => {
    const [startDate, endDate] = values.dateRange;
    const payloadValues = {
      title: values.title.trim(),
      // intro: values.intro?.trim() ?? "",
      body: values.content.trim(),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      publish_status: parseInt(values.status, 10),
    };
    console.log("Payload values:", payloadValues);
    return payloadValues;
  };

  const handleFinishFailed = ({
    errorFields,
  }: {
    errorFields: { name: (string | number)[]; errors: string[] }[];
  }) => {
    messageApi.error({
      content: (
        <>
          <strong>Error al Guardar la noticia:</strong>
          <ul className="text-left list-disc px-4">
            {errorFields.map((field, index) => (
              <li key={index}>{field.errors.join(", ")}</li>
            ))}
          </ul>
        </>
      ),
      duration: 5,
    });
  };

  return (
    <Layout className="flex flex-col">
      {contextHolder}
      <Spin spinning={isPending} size="large" fullscreen />
      <Spin spinning={isLoading} size="large" fullscreen />
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
              >
                Guardar
              </Button>
            </div>
          </Header>
          <Content className="flex-1 pr-4 pt-4">
            <div className="flex flex-col h-full">
              <Form.Item
                name="body"
                className="bg-white rounded-lg p-4! flex-1 flex flex-col mb-0!"
              >
                <QuillEditor
                  value={form.getFieldValue("body")}
                  onChange={(body: string) => form.setFieldsValue({ body })}
                  height="calc(100vh - 250px)" // Altura calculada dinámicamente
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
