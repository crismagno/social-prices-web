"use client";

import "antd/dist/reset.css";

import React from "react";

import { App as AntdApp, ConfigProvider } from "antd";

import { antdThemeConfig } from "../../lib-antd/theme";
import { AppProvider } from "../context/app/AppContext";
import { AuthProvider } from "../context/auth/AuthContext";
import { SocketProvider } from "../context/socket/SocketContext";

export function Providers({ children }: any) {
  return (
    <ConfigProvider theme={antdThemeConfig}>
      <AntdApp>
        <AuthProvider>
          <AppProvider>
            <SocketProvider>{children}</SocketProvider>
          </AppProvider>
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
