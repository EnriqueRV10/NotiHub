"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import React from "react";
import esEs from "antd/locale/es_ES";

const queryClient = new QueryClient();

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#fa541c",
          colorLink: "#fa541c",
        },
      }}
      locale={esEs}
    >
      <QueryClientProvider client={queryClient}>
        <AntdRegistry>{children}</AntdRegistry>
      </QueryClientProvider>
    </ConfigProvider>
  );
}
