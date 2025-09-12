"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, Layout, Menu, MenuProps, Breadcrumb } from "antd";
import React, { useState } from "react";
import esEs from "antd/locale/es_ES";
import { useRouter, usePathname } from "next/navigation";
import { HomeOutlined, PieChartOutlined } from "@ant-design/icons";
import { capitalize } from "lodash"; // Para capitalizar los nombres

const queryClient = new QueryClient();

const inter = Inter({ subsets: ["latin"] });

const { Header, Content, Sider } = Layout;

const siderStyle: React.CSSProperties = {
  overflow: "auto",
  height: "100vh",
  position: "sticky",
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: "thin",
};

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

  // Mapea la ruta actual a la clave del menú principal
  const getSelectedKey = (path: string) => {
    if (path === "/") return "/";
    if (path.startsWith("/Datos")) return "/Datos";
    return "/";
  };

  const selectedKey = getSelectedKey(pathname);

  // Genera los items del breadcrumb según la ruta actual
  const segments = pathname.split("/").filter(Boolean);

  let breadcrumbData: { title: string; href: string }[] = [];

  if (segments.length === 0) {
    // Solo en "/"
    breadcrumbData = [{ title: "Inicio", href: "/" }];
  } else if (segments[0] === "Datos") {
    // En "/Datos" y sus hijos
    breadcrumbData = segments.map((segment, idx) => ({
      title: capitalize(segment),
      href: "/" + segments.slice(0, idx + 1).join("/"),
    }));
  } else {
    // Para otras rutas, muestra Inicio + jerarquía
    breadcrumbData = [
      { title: "Inicio", href: "/" },
      ...segments.map((segment, idx) => ({
        title: capitalize(segment),
        href: "/" + segments.slice(0, idx + 1).join("/"),
      })),
    ];
  }

  return (
    <html lang="es">
      <body className={inter.className}>
        <ConfigProvider locale={esEs}>
          <QueryClientProvider client={queryClient}>
            <AntdRegistry>
              <Layout style={{ minHeight: "100vh" }}>
                <Sider
                  collapsible={false}
                  collapsed={collapsed}
                  onCollapse={(value) => setCollapsed(value)}
                  style={siderStyle}
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
                    selectedKeys={[selectedKey]}
                    mode="inline"
                    items={items}
                    onClick={handleMenuClick}
                  />
                </Sider>
                <Layout>
                  <Header
                    style={{
                      background: "#fff",
                      padding: "0 24px",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Breadcrumb
                      items={breadcrumbData.map((item, idx) => ({
                        title:
                          idx === breadcrumbData.length - 1 ? (
                            <span>{item.title}</span>
                          ) : (
                            <a href={item.href}>{item.title}</a>
                          ),
                      }))}
                    />
                  </Header>
                  <Content style={{ margin: "16px" }}>{children}</Content>
                </Layout>
              </Layout>
            </AntdRegistry>
          </QueryClientProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
