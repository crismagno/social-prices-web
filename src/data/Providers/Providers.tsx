"use client";

import 'antd/dist/reset.css';

import React, { useEffect } from 'react';

import {
  App as AntdApp,
  ConfigProvider,
} from 'antd';

import {
  setHandleClientErrorLimitMessageBuilder,
  setHandleClientErrorMessageApi,
} from '../../components/common/HandleClientError/HandleClientError';
import { antdThemeConfig } from '../../lib-antd/theme';
import { AppProvider } from '../context/app/AppContext';
import { AuthProvider } from '../context/auth/AuthContext';
import { LanguageProvider } from '../context/language/LanguageContext';
import useLanguageData from '../context/language/useLanguageData';
import { ManagerAuthProvider } from '../context/managerAuth/ManagerAuthContext';
import { SocketProvider } from '../context/socket/SocketContext';

const MessageApiSetter: React.FC = () => {
  const { message } = AntdApp.useApp();
  useEffect(() => {
    setHandleClientErrorMessageApi(message);
  }, [message]);
  return null;
};

const LimitMessageSetter: React.FC = () => {
  const { t } = useLanguageData();
  useEffect(() => {
    setHandleClientErrorLimitMessageBuilder((feature: string, limit: number) =>
      t('limits.reached')
        .replace('{limit}', String(limit))
        .replace('{feature}', t(`limits.features.${feature}`)),
    );
  }, [t]);
  return null;
};

export function Providers({ children }: any) {
  return (
    <ConfigProvider theme={antdThemeConfig}>
      <AntdApp>
        <MessageApiSetter />
        <LanguageProvider>
          <LimitMessageSetter />
          <ManagerAuthProvider>
            <AuthProvider>
              <AppProvider>
                <SocketProvider>{children}</SocketProvider>
              </AppProvider>
            </AuthProvider>
          </ManagerAuthProvider>
        </LanguageProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
