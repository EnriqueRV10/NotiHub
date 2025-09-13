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
import { convertApiToComponentFormat } from "@/features/news/utils/APItoForm";
import { convertComponentToApiFormat } from "@/features/news/utils/FormtoAPI";

const { Header, Sider, Content } = Layout;

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Borrador", color: "grey" },
  1: { text: "Preview", color: "orange" },
  2: { text: "Publicado", color: "green" },
};

interface ComponentGroup {
  combinator: "and" | "or";
  list: ComponentRule[];
}

interface ComponentRule {
  field: string;
  operator: "=";
  value?: string;
  field_extra?: string;
  value_extra?: string;
}

interface FormValues {
  title: string;
  intro: string;
  content: string;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
  status: string;
  filter: ComponentGroup[];
  exclude: ComponentGroup[];
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
      let filterRules: ComponentGroup[] = [{ combinator: "and", list: [] }];
      let excludeRules: ComponentGroup[] = [{ combinator: "and", list: [] }];

      if (data.data.employee_assignment_policy) {
        const { filter, exclude } = data.data.employee_assignment_policy;

        if (filter && filter.rules && filter.rules.length > 0) {
          filterRules = convertApiToComponentFormat({
            rules: filter.rules,
            id: filter.id,
            combinator: filter.combinator,
          });
        }

        if (exclude && exclude.rules && exclude.rules.length > 0) {
          excludeRules = convertApiToComponentFormat({
            rules: exclude.rules,
            id: exclude.id,
            combinator: exclude.combinator,
          });
        }
      }

      if (filterRules.length === 0) {
        filterRules = [{ combinator: "and", list: [] }];
      }
      if (excludeRules.length === 0) {
        excludeRules = [{ combinator: "and", list: [] }];
      }

      form.setFieldsValue({
        title: data.data.title,
        intro: data.data.intro,
        dateRange: [
          data.data.start_date ? dayjs(data.data.start) : null,
          data.data.end_date ? dayjs(data.data.end) : null,
        ],
        status: data.data.publish_status.toString(),
        filter: filterRules,
        exclude: excludeRules,
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
    if (payload) {
      mutate(payload);
    }
  };

  const formToAPI = (values: FormValues): any | null => {
    const [startDate, endDate] = values.dateRange;
    let employee_assignment_policy: any["employee_assignment_policy"] = {};

    const hasFilterRules = values.filter?.some(
      (group) => group.list.length > 0
    );
    const hasExcludeRules = values.exclude?.some(
      (group) => group.list.length > 0
    );

    if (hasFilterRules || hasExcludeRules) {
      employee_assignment_policy.filter = convertComponentToApiFormat(
        values.filter
      );
      employee_assignment_policy.exclude = convertComponentToApiFormat(
        values.exclude
      );
    }

    return {
      title: values.title.trim(),
      intro: values.intro?.trim() ?? "",
      body: values.content.trim(),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      publish_status: parseInt(values.status, 10),
      employee_assignment_policy,
      attachements: [],
    };
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
    <Layout className="h-screen flex flex-col">
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
        <Layout className="overflow-hidden">
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
            <div className="flex items-center">
              <Form.Item name="status" style={{ marginBottom: 0 }}>
                <Select
                  placeholder="Seleccionar estado"
                  suffixIcon={<CaretDownOutlined />}
                  options={Object.entries(statusMap).map(([key, { text }]) => ({
                    label: text,
                    value: key,
                  }))}
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
          <Content className="p-6">
            <div className="bg-white rounded-lg p-4">
              <Form.Item noStyle name="body">
                <QuillEditor
                  value={form.getFieldValue("body")}
                  onChange={(body: String) => form.setFieldsValue({ body })}
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
