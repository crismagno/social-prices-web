"use client";

import React from "react";

import { ConfigProvider } from "antd";

import StyledComponentsRegistry from "../../lib-antd/AntdRegistry";
import { antdThemeConfig } from "../../lib-antd/theme";
import { AppProvider } from "../context/app/AppContext";
import { AuthProvider } from "../context/auth/AuthContext";
import { SocketProvider } from "../context/socket/SocketContext";

export function Providers({ children }: any) {
  return (
    <StyledComponentsRegistry>
      <ConfigProvider theme={antdThemeConfig}>
        <AuthProvider>
          <AppProvider>
            <SocketProvider>{children}</SocketProvider>
          </AppProvider>
        </AuthProvider>
      </ConfigProvider>
    </StyledComponentsRegistry>
  );
}
