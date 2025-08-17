import React, { useEffect, useState } from "react";
import {
  Tabs,
  Form,
  Input,
  DatePicker,
  Button,
  Divider,
  Popover,
  message,
} from "antd";
import type { FormInstance, TabsProps } from "antd";
import { AssignmentsComponent } from "./AssignmentsComponent";
import { useTestAssignment } from "@/features/news/hooks";
import { convertComponentToApiFormat } from "@/features/news/utils/FormtoAPI";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface TabsComponentProps {
  form: FormInstance;
}

export const TabsComponent = ({ form }: TabsComponentProps) => {
  const { mutate, data, error, isPending } = useTestAssignment();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleTest = () => {
    const payload = {
      exclude: convertComponentToApiFormat(form.getFieldValue("exclude")),
      filter: convertComponentToApiFormat(form.getFieldValue("filter")),
    };

    mutate(payload);
  };

  useEffect(() => {
    if (data) {
      setPopoverOpen(true);
    }
    if (error) {
      setPopoverOpen(false);
      messageApi.error({
        content: "Error al probar la asignación",
        duration: 5,
      });
    }
  }, [data, error, messageApi]);

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
      children: (
        <div className="p-4">
          {contextHolder}

          <Divider>Incluir</Divider>
          <AssignmentsComponent form={form} name="filter" />
          <Divider>Excluir</Divider>
          <AssignmentsComponent form={form} name="exclude" />
        </div>
      ),
    },
  ];

  return <Tabs defaultActiveKey="1" items={itemstab} centered />;
};
