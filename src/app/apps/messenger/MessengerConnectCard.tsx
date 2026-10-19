"use client";

import { useState } from "react";

import { Alert, App, Button, Card, ConfigProvider, Radio, theme } from "antd";

import { ExportOutlined, FacebookFilled } from "@ant-design/icons";

import AppIcon from "../../../components/common/AppIcon/AppIcon";
import {
  ConnectHero,
  ConnectStep,
  ConnectSteps,
} from "../../../components/common/ConnectSteps/ConnectSteps";
import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import AppsEnum from "../../../shared/business/apps/apps.enum";
import {
  IMessengerConnection,
  IMessengerPendingPage,
} from "../../../shared/business/apps/messenger/messenger.types";
import { MESSENGER_BLUE, messengerErrorCode } from "./messenger-display";

const KNOWN_ERRORS: string[] = [
  "MESSENGER_PAGE_ALREADY_CONNECTED",
  "MESSENGER_PAGE_NOT_AVAILABLE",
  "MESSENGER_PAGE_SUBSCRIBE_FAILED",
];

interface Props {
  canManage: boolean;
  // Why the last login did not end in a connection, as the callback reported it.
  errorCode: string | null;
  // Pages the login brought for the user to choose from.
  pendingPages: IMessengerPendingPage[];
  onConnected: (connection: IMessengerConnection) => void;
}

export default function MessengerConnectCard({
  canManage,
  errorCode,
  pendingPages,
  onConnected,
}: Props) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const { token } = theme.useToken();

  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  const [pageId, setPageId] = useState<string | null>(
    pendingPages[0]?.pageId ?? null,
  );

  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  const handleConnect = async (): Promise<void> => {
    try {
      setIsRedirecting(true);

      const { url } =
        await serviceMethodsInstance.messengerServiceMethods.connect();

      // Facebook's own screen takes over; it brings the user back here.
      window.location.href = url;
    } catch (error: any) {
      handleClientError(error);
      setIsRedirecting(false);
    }
  };

  const handleSelect = async (): Promise<void> => {
    if (!pageId) {
      return;
    }

    try {
      setIsSelecting(true);

      const connection =
        await serviceMethodsInstance.messengerServiceMethods.selectPage(pageId);

      message.success(t("apps.messenger.connectedToast"));

      onConnected(connection);
    } catch (error: any) {
      const code: string | null = messengerErrorCode(error);

      if (code && KNOWN_ERRORS.includes(code)) {
        message.error(t(`apps.messenger.errors.${code}`));
      } else {
        handleClientError(error);
      }
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: MESSENGER_BLUE } }}>
      <Card>
        <div className="max-w-2xl">
          <ConnectHero
            icon={<AppIcon app={AppsEnum.App.FACEBOOK} />}
            accentColor={MESSENGER_BLUE}
            title={t("apps.messenger.connectTitle")}
            subtitle={t("apps.messenger.connectSubtitle")}
          />

          {errorCode && (
            <Alert
              className="mt-6"
              type="error"
              showIcon
              message={t(`apps.messenger.errors.${errorCode}`)}
            />
          )}

          {!canManage && (
            <Alert
              className="mt-6"
              type="info"
              showIcon
              message={t("apps.messenger.managersOnly")}
            />
          )}

          <ConnectSteps>
            <ConnectStep
              accentColor={MESSENGER_BLUE}
              position={1}
              title={t("apps.messenger.steps.page.title")}
            >
              <p
                className="m-0 mb-3"
                style={{ color: token.colorTextSecondary }}
              >
                {t("apps.messenger.steps.page.text")}
              </p>

              <Button
                href="https://www.facebook.com/pages/create"
                target="_blank"
                rel="noopener noreferrer"
                icon={<ExportOutlined />}
              >
                {t("apps.messenger.steps.page.action")}
              </Button>
            </ConnectStep>

            <ConnectStep
              accentColor={MESSENGER_BLUE}
              position={2}
              title={t("apps.messenger.steps.login.title")}
              isCurrent={!pendingPages.length}
              isLast={!pendingPages.length}
            >
              <p
                className="m-0 mb-3"
                style={{ color: token.colorTextSecondary }}
              >
                {t("apps.messenger.steps.login.text")}
              </p>

              <Button
                type="primary"
                size="large"
                icon={<FacebookFilled />}
                loading={isRedirecting}
                disabled={!canManage}
                onClick={handleConnect}
              >
                {t("apps.messenger.connect")}
              </Button>
            </ConnectStep>

            {pendingPages.length > 0 && (
              <ConnectStep
                accentColor={MESSENGER_BLUE}
                position={3}
                title={t("apps.messenger.steps.choose.title")}
                isCurrent
                isLast
              >
                <p
                  className="m-0 mb-3"
                  style={{ color: token.colorTextSecondary }}
                >
                  {t("apps.messenger.steps.choose.text")}
                </p>

                <Radio.Group
                  className="mb-3 flex flex-col gap-2"
                  value={pageId}
                  onChange={(event) => setPageId(event.target.value)}
                >
                  {pendingPages.map((page: IMessengerPendingPage) => (
                    <Radio key={page.pageId} value={page.pageId}>
                      {page.pageName}
                    </Radio>
                  ))}
                </Radio.Group>

                <Button
                  type="primary"
                  loading={isSelecting}
                  disabled={!canManage || !pageId}
                  onClick={handleSelect}
                >
                  {t("apps.messenger.steps.choose.action")}
                </Button>
              </ConnectStep>
            )}
          </ConnectSteps>
        </div>
      </Card>
    </ConfigProvider>
  );
}
