import React, { useEffect } from "react";
import { Drawer, Button, Space, Form, Input, message, Spin } from "antd";
import { useCreateNews } from "@/features/news/hooks/useCreateNews";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

interface DrawerComponentProps {
  visible: boolean;
  onClose: () => void;
}

export default function NewsCreationDrawer({
  visible,
  onClose,
}: DrawerComponentProps) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const { mutate, isPending, isSuccess, isError } = useCreateNews((data) => {
    // La funcion se ejecuta cuando la funcion es exitosa
    router.push(`/${data.data.id}`);
  });

  const handleFinish = (values: { title: string }) => {
    const startDate = dayjs();
    const endDate = startDate.add(1, 'month');

    const newsData = {
      title: values.title.trim(),
      content: "",
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      publish_status: 0,
    };
    console.log("Noticia Creada:", newsData);
    mutate(newsData);
  };

  const handleClose = () => {
    if (!isPending) {
      form.resetFields();
      onClose();
    }
  };

  // Resetea el formulario cuando el Drawer se cierra
  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);

  // Cuando la noticia se cre con éxito, muestra un mensaje
  useEffect(() => {
    if (isSuccess) {
      messageApi.success({
        content: "Noticia creada con éxito",
        duration: 5,
      });
      handleClose();
    }
  }, [isSuccess, messageApi]);

  // Muestra un mensaje de error si la noticia no se crea correctamente
  useEffect(() => {
    if (isError) {
      messageApi.error({
        content: `Error al crear la noticia`,
        duration: 5,
      });
    }
  }, [isError, messageApi]);

  return (
    <Drawer
      title="Nueva Noticia"
      placement="right"
      onClose={handleClose}
      open={visible}
      maskClosable={!isPending}
    >
      {contextHolder}
      {/* <Spin spinning={isPending} fullscreen /> */}
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="title"
          label="Título"
          rules={[
            { required: true, message: "Campo Título requerido" },
            { max: 128, message: "El título no puede exceder los 128 caracteres" }
          ]}
          required={false}
        >
          <Input maxLength={128} autoComplete="off"/>
        </Form.Item>
        <Space>
          <Button type="text" onClick={handleClose} disabled={isPending}>Cancelar</Button>
          <Form.Item noStyle>
            <Button type="primary" htmlType="submit" shape="round" loading={isPending}>
              Crear
            </Button>
          </Form.Item>
        </Space>
      </Form>
    </Drawer>
  );
}
