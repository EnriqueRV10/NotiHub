"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, Layout, Menu, MenuProps } from "antd";
import React, { useState } from "react";
import esEs from "antd/locale/es_ES";
import { useRouter, usePathname } from "next/navigation";
import { HomeOutlined, PieChartOutlined } from "@ant-design/icons";
import path from "path";

const queryClient = new QueryClient();

const inter = Inter({ subsets: ["latin"] });

const { Header, Content, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const items: MenuItem[] = [
    getItem("Inicio", "/", <HomeOutlined />),
    getItem("Datos", "/Datos", <PieChartOutlined />),
  ];

  const handleMenuClick = (e: { key: string }) => {
    if (pathname !== e.key) {
      router.push(e.key);
    }
  };

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
                    style={{
                      color: "white",
                      padding: 16,
                      textAlign: "left",
                      fontWeight: "bold",
                      fontSize: 18,
                    }}
                  >
                    NotiHub
                  </div>

                  <Menu
                    theme="dark"
                    defaultSelectedKeys={[pathname]}
                    mode="inline"
                    items={items}
                    onClick={handleMenuClick}
                  />
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
