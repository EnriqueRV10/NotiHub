import React, { useState } from "react";
import { Tabs, Form, Input, DatePicker, Divider, message } from "antd";
import type { FormInstance, TabsProps } from "antd";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface TabsComponentProps {
  form: FormInstance;
}

export const TabsComponent = ({ form }: TabsComponentProps) => {
  const [messageApi, contextHolder] = message.useMessage();

  const itemstab: TabsProps["items"] = [
    {
      key: "1",
      label: "Info",
      children: (
        <div className="mx-3">
          <Form.Item
            name="title"
            label="Titulo"
            rules={[{ required: true, message: "Campo Título requerido" }]}
            required={false}
          >
            <Input maxLength={128} showCount />
          </Form.Item>
          <Divider />
          <Form.Item name="intro" label="Intro">
            <TextArea
              placeholder="Introducción a la noticia"
              rows={6}
              maxLength={255}
              showCount
            />
          </Form.Item>
          <Divider />
          <Form.Item
            name="dateRange"
            label="Vigencia"
            rules={[
              { required: true, message: "Seleccione un rango de fechas" },
            ]}
            required={false}
          >
            <RangePicker />
          </Form.Item>
        </div>
      ),
    },
    {
      key: "2",
      label: "Asignación",
      children: <div className="p-4">{contextHolder}</div>,
    },
  ];

  return <Tabs defaultActiveKey="1" items={itemstab} centered />;
};
