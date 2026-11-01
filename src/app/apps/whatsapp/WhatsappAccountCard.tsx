"use client";

import { useState } from "react";

import { App, Avatar, Badge, Button, Card, Popconfirm } from "antd";
import dayjs from "dayjs";

import { WhatsAppOutlined } from "@ant-design/icons";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IWhatsappConnection } from "../../../shared/business/apps/whatsapp/whatsapp.types";
import { WHATSAPP_GREEN } from "./whatsapp-display";

interface Props {
  connection: IWhatsappConnection;
  canManage: boolean;
  onDisconnected: () => void;
}

// Whose number is connected, when the last message came, and the way out.
export default function WhatsappAccountCard({
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

      await serviceMethodsInstance.whatsappServiceMethods.disconnect();

      message.success(t("apps.whatsapp.disconnected"));

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
            icon={<WhatsAppOutlined />}
            style={{ backgroundColor: WHATSAPP_GREEN }}
          />

          <div className="min-w-0">
            <div className="truncate text-lg font-semibold leading-tight">
              {connection.verifiedName || connection.displayPhoneNumber}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 text-sm opacity-70">
              {connection.verifiedName && (
                <span>{connection.displayPhoneNumber}</span>
              )}

              <Badge
                status="success"
                text={t("apps.whatsapp.account.connected")}
              />

              <span>
                {t("apps.whatsapp.account.lastMessage")}{" "}
                {connection.lastUpdateAt
                  ? dayjs(connection.lastUpdateAt).format("DD/MM/YYYY HH:mm")
                  : t("apps.whatsapp.account.none")}
              </span>
            </div>
          </div>
        </div>

        <Popconfirm
          title={t("apps.whatsapp.account.disconnectConfirm")}
          okText={t("apps.whatsapp.account.disconnect")}
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
            {t("apps.whatsapp.account.disconnect")}
          </Button>
        </Popconfirm>
      </div>
    </Card>
  );
}
