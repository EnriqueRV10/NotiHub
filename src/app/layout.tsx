"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import React from "react";
import esEs from "antd/locale/es_ES";

const queryClient = new QueryClient();

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ConfigProvider locale={esEs}>
          <QueryClientProvider client={queryClient}>
            <AntdRegistry>{children}</AntdRegistry>
          </QueryClientProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
