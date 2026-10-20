"use client";

import { useState } from "react";

import { App, Avatar, Badge, Button, Card, Popconfirm } from "antd";
import dayjs from "dayjs";

import { ExportOutlined } from "@ant-design/icons";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IInstagramConnection } from "../../../shared/business/apps/instagram/instagram.types";
import { INSTAGRAM_PINK } from "./instagram-display";

interface Props {
  connection: IInstagramConnection;
  canManage: boolean;
  onDisconnected: () => void;
}

// Whose account is connected, when the last message came, and the way out.
export default function InstagramAccountCard({
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

      await serviceMethodsInstance.instagramServiceMethods.disconnect();

      message.success(t("apps.instagram.disconnected"));

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
          <Avatar
            size={56}
            src={connection.profilePictureUrl ?? undefined}
            style={{ backgroundColor: INSTAGRAM_PINK, fontWeight: 600 }}
          >
            {(connection.username ?? "?")[0].toUpperCase()}
          </Avatar>

          <div className="min-w-0">
            <div className="truncate text-lg font-semibold leading-tight">
              {connection.name || `@${connection.username}`}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 text-sm opacity-70">
              {connection.name && <span>@{connection.username}</span>}

              <Badge
                status="success"
                text={t("apps.instagram.account.connected")}
              />

              <span>
                {t("apps.instagram.account.lastMessage")}{" "}
                {connection.lastUpdateAt
                  ? dayjs(connection.lastUpdateAt).format("DD/MM/YYYY HH:mm")
                  : t("apps.instagram.account.none")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            href={`https://www.instagram.com/${connection.username}`}
            target="_blank"
            rel="noopener noreferrer"
            icon={<ExportOutlined />}
          >
            {t("apps.instagram.account.open")}
          </Button>

          <Popconfirm
            title={t("apps.instagram.account.disconnectConfirm")}
            okText={t("apps.instagram.account.disconnect")}
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
              {t("apps.instagram.account.disconnect")}
            </Button>
          </Popconfirm>
        </div>
      </div>
    </Card>
  );
}
