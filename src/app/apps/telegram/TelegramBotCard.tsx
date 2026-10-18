"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  App,
  Badge,
  Button,
  Card,
  Divider,
  Popconfirm,
  Space,
  Tag,
  theme,
} from "antd";
import dayjs from "dayjs";

import { CheckCircleFilled, ExportOutlined } from "@ant-design/icons";

import AppIcon from "../../../components/common/AppIcon/AppIcon";
import { AppTile } from "../../../components/common/ConnectSteps/ConnectSteps";
import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import AppsEnum from "../../../shared/business/apps/apps.enum";
import {
  ITelegramConnection,
  ITelegramWebhookStatus,
} from "../../../shared/business/apps/telegram/telegram.types";
import { TELEGRAM_BLUE } from "./telegram-theme";

interface Props {
  connection: ITelegramConnection;
  canManage: boolean;
  onDisconnected: () => void;
}

// Who is connected, the way out, and whether Telegram can still reach us: the
// first thing to look at when messages stop coming (a new ngrok address, say).
export default function TelegramBotCard({
  connection,
  canManage,
  onDisconnected,
}: Props) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const { token } = theme.useToken();

  const [status, setStatus] = useState<ITelegramWebhookStatus | null>(null);

  const [isChecking, setIsChecking] = useState<boolean>(false);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);

  const botUrl: string = `https://t.me/${connection.botUsername ?? ""}`;

  const checkDelivery = useCallback(async (silent: boolean) => {
    try {
      setIsChecking(true);

      setStatus(
        await serviceMethodsInstance.telegramServiceMethods.getWebhookStatus(),
      );
    } catch (error: any) {
      if (!silent) {
        handleClientError(error);
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkDelivery(true);
  }, [checkDelivery]);

  const handleRefresh = async (): Promise<void> => {
    try {
      setIsRefreshing(true);

      setStatus(
        await serviceMethodsInstance.telegramServiceMethods.refreshWebhook(),
      );

      message.success(t("apps.telegram.webhook.refreshed"));
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDisconnect = async (): Promise<void> => {
    try {
      setIsDisconnecting(true);

      await serviceMethodsInstance.telegramServiceMethods.disconnect();

      message.success(t("apps.telegram.disconnected"));

      onDisconnected();
    } catch (error: any) {
      handleClientError(error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const refreshButton = canManage && (
    <Button size="small" loading={isRefreshing} onClick={handleRefresh}>
      {t("apps.telegram.webhook.refresh")}
    </Button>
  );

  // Healthy is a quiet pill; only a problem takes a banner of its own.
  const isHealthy: boolean =
    !!status && status.urlMatches && !status.hasActiveError;

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <AppTile
            icon={<AppIcon app={AppsEnum.App.TELEGRAM} />}
            accentColor={TELEGRAM_BLUE}
            size={56}
          />

          <div className="min-w-0">
            <h2 className="m-0 truncate text-xl font-semibold leading-tight">
              {connection.botName ?? `@${connection.botUsername}`}
            </h2>

            <div className="mt-1 flex items-center gap-2">
              <Badge status="success" />

              <a
                href={botUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: token.colorTextSecondary }}
              >
                @{connection.botUsername}
              </a>
            </div>
          </div>
        </div>

        <Space wrap>
          <Button
            href={botUrl}
            target="_blank"
            rel="noopener noreferrer"
            icon={<ExportOutlined />}
          >
            {t("apps.telegram.openBot")}
          </Button>

          <Popconfirm
            title={t("apps.telegram.disconnectConfirm")}
            onConfirm={handleDisconnect}
            disabled={!canManage}
          >
            <Button
              type="primary"
              danger
              loading={isDisconnecting}
              disabled={!canManage}
            >
              {t("apps.telegram.disconnect")}
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Divider className="my-4" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {isHealthy && (
            <Space size={8} wrap>
              <Tag color="success" icon={<CheckCircleFilled />} className="m-0">
                {t("apps.telegram.webhook.delivering")}
              </Tag>

              {status && status.pendingUpdateCount > 0 && (
                <Tag className="m-0">
                  {t("apps.telegram.webhook.pending").replace(
                    "{count}",
                    String(status.pendingUpdateCount),
                  )}
                </Tag>
              )}
            </Space>
          )}

          <span style={{ color: token.colorTextSecondary }}>
            {t("apps.telegram.lastMessage")}:{" "}
            <span style={{ color: token.colorText }}>
              {connection.lastUpdateAt
                ? dayjs(connection.lastUpdateAt).format("DD/MM/YYYY HH:mm")
                : t("apps.telegram.noMessagesYet")}
            </span>
          </span>
        </div>

        <Button
          size="small"
          type="text"
          loading={isChecking}
          onClick={() => checkDelivery(false)}
        >
          {t("apps.telegram.webhook.check")}
        </Button>
      </div>

      {status && !status.urlMatches && (
        <Alert
          className="mt-4"
          type="warning"
          showIcon
          message={t("apps.telegram.webhook.urlChanged")}
          action={refreshButton}
        />
      )}

      {status && status.urlMatches && status.hasActiveError && (
        <Alert
          className="mt-4"
          type="error"
          showIcon
          message={t("apps.telegram.webhook.lastError")
            .replace(
              "{date}",
              status.lastErrorDate
                ? dayjs(status.lastErrorDate).format("DD/MM/YYYY HH:mm")
                : "",
            )
            .replace("{error}", status.lastErrorMessage ?? "")}
          action={refreshButton}
        />
      )}
    </Card>
  );
}
