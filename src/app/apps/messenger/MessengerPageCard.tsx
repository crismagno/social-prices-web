"use client";

import { useState } from "react";

import { App, Badge, Button, Card, Popconfirm } from "antd";
import dayjs from "dayjs";

import { ExportOutlined } from "@ant-design/icons";

import AppIcon from "../../../components/common/AppIcon/AppIcon";
import { AppTile } from "../../../components/common/ConnectSteps/ConnectSteps";
import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import AppsEnum from "../../../shared/business/apps/apps.enum";
import { IMessengerConnection } from "../../../shared/business/apps/messenger/messenger.types";
import { MESSENGER_BLUE } from "./messenger-display";

interface Props {
  connection: IMessengerConnection;
  canManage: boolean;
  onDisconnected: () => void;
}

// Whose Page is connected, when the last message came, and the way out.
export default function MessengerPageCard({
  connection,
  canManage,
  onDisconnected,
}: Props) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);

  const handleDisconnect = async (): Promise<void> => {
    try {
      setIsDisconnecting(true);

      await serviceMethodsInstance.messengerServiceMethods.disconnect();

      message.success(t("apps.messenger.disconnected"));

      onDisconnected();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <AppTile
            icon={<AppIcon app={AppsEnum.App.FACEBOOK} />}
            accentColor={MESSENGER_BLUE}
            size={56}
          />

          <div className="min-w-0">
            <div className="truncate text-lg font-semibold leading-tight">
              {connection.pageName}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 text-sm opacity-70">
              <Badge
                status="success"
                text={t("apps.messenger.page.connected")}
              />

              <span>
                {t("apps.messenger.page.lastMessage")}{" "}
                {connection.lastUpdateAt
                  ? dayjs(connection.lastUpdateAt).format("DD/MM/YYYY HH:mm")
                  : t("apps.messenger.page.none")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {connection.pageId && (
            <Button
              href={`https://www.facebook.com/${connection.pageId}`}
              target="_blank"
              rel="noopener noreferrer"
              icon={<ExportOutlined />}
            >
              {t("apps.messenger.page.open")}
            </Button>
          )}

          <Popconfirm
            title={t("apps.messenger.page.disconnectConfirm")}
            okText={t("apps.messenger.page.disconnect")}
            okButtonProps={{ danger: true }}
            disabled={!canManage}
            onConfirm={handleDisconnect}
          >
            <Button
              danger
              type="primary"
              loading={isDisconnecting}
              disabled={!canManage}
            >
              {t("apps.messenger.page.disconnect")}
            </Button>
          </Popconfirm>
        </div>
      </div>
    </Card>
  );
}
