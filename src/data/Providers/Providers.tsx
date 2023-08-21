"use client";

import React from "react";

import { AppProvider } from "../context/AppContext";
import { AuthProvider } from "../context/AuthContext";

export function Providers({ children }: any) {
  return (
    <AuthProvider>
      <AppProvider>{children}</AppProvider>
    </AuthProvider>
  );
}
