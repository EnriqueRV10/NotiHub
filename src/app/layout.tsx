"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, Layout, Menu } from "antd";
import React, { useState } from "react";
import esEs from "antd/locale/es_ES";

const queryClient = new QueryClient();

const inter = Inter({ subsets: ["latin"] });

const { Header, Content, Sider } = Layout;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <html lang="es">
      <body className={inter.className}>
        <ConfigProvider locale={esEs}>
          <QueryClientProvider client={queryClient}>
            <AntdRegistry>
              <Layout style={{ minHeight: "100vh" }}>
                <Sider
                  collapsible
                  collapsed={collapsed}
                  onCollapse={(value) => setCollapsed(value)}
                >
                  <div
                    style={{ color: "white", padding: 16, textAlign: "left" }}
                  >
                    NotiHub
                  </div>
                </Sider>
                <Layout>
                  <Header
                    style={{
                      background: "#fff",
                      padding: 0,
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      width: "100%",
                      display: "flex",
                    }}
                  >
                    {/* Contenido del Header */}
                  </Header>
                  <Content>{children}</Content>
                </Layout>
              </Layout>
            </AntdRegistry>
          </QueryClientProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
