"use client";

import 'antd/dist/reset.css';

import React, { useEffect } from 'react';

import {
  App as AntdApp,
  ConfigProvider,
} from 'antd';

import { setHandleClientErrorMessageApi } from '../../components/common/HandleClientError/HandleClientError';
import { antdThemeConfig } from '../../lib-antd/theme';
import { AppProvider } from '../context/app/AppContext';
import { AuthProvider } from '../context/auth/AuthContext';
import { LanguageProvider } from '../context/language/LanguageContext';
import { SocketProvider } from '../context/socket/SocketContext';

const MessageApiSetter: React.FC = () => {
  const { message } = AntdApp.useApp();
  useEffect(() => {
    setHandleClientErrorMessageApi(message);
  }, [message]);
  return null;
};

export function Providers({ children }: any) {
  return (
    <ConfigProvider theme={antdThemeConfig}>
      <AntdApp>
        <MessageApiSetter />
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
