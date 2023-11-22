"use client";

import React from "react";

import { ConfigProvider } from "antd";

import StyledComponentsRegistry from "../../lib-antd/AntdRegistry";
import { antdThemeConfig } from "../../lib-antd/theme";
import { AppProvider } from "../context/AppContext";
import { AuthProvider } from "../context/AuthContext";

export function Providers({ children }: any) {
  return (
    <StyledComponentsRegistry>
      <ConfigProvider theme={antdThemeConfig}>
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      </ConfigProvider>
    </StyledComponentsRegistry>
  );
}
