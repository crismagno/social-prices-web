"use client";

import React from "react";

import StyledComponentsRegistry from "../../lib/AntdRegistry";
import { AppProvider } from "../context/AppContext";
import { AuthProvider } from "../context/AuthContext";

export function Providers({ children }: any) {
  return (
    <StyledComponentsRegistry>
      <AuthProvider>
        <AppProvider>{children}</AppProvider>
      </AuthProvider>
    </StyledComponentsRegistry>
  );
}
