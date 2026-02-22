"use client";

import 'antd/dist/reset.css';

import React from 'react';

import {
  App as AntdApp,
  ConfigProvider,
} from 'antd';

import { antdThemeConfig } from '../../lib-antd/theme';
import { AppProvider } from '../context/app/AppContext';
import { AuthProvider } from '../context/auth/AuthContext';
import { LanguageProvider } from '../context/language/LanguageContext';
import { SocketProvider } from '../context/socket/SocketContext';

export function Providers({ children }: any) {
  return (
    <ConfigProvider theme={antdThemeConfig}>
      <AntdApp>
        <LanguageProvider>
          <AuthProvider>
            <AppProvider>
              <SocketProvider>{children}</SocketProvider>
            </AppProvider>
          </AuthProvider>
        </LanguageProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
