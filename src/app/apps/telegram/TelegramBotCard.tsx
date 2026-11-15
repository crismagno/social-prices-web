"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  App,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Image,
  Popconfirm,
  Space,
  Tag,
  theme,
  Typography,
} from "antd";
import dayjs from "dayjs";

import {
  CheckCircleFilled,
  EditOutlined,
  ExportOutlined,
} from "@ant-design/icons";

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
import TelegramBotProfileModal from "./TelegramBotProfileModal";
import { TELEGRAM_BLUE } from "./telegram-theme";
import { useTelegramBotProfile } from "./useTelegramBotProfile";

interface Props {
  connection: ITelegramConnection;
  canManage: boolean;
  onDisconnected: () => void;
  onBotNameChanged: (botName: string) => void;
}

// Who is connected, the way out, and whether Telegram can still reach us: the
// first thing to look at when messages stop coming (a new ngrok address, say).
export default function TelegramBotCard({
  connection,
  canManage,
  onDisconnected,
  onBotNameChanged,
}: Props) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const { token } = theme.useToken();

  const [status, setStatus] = useState<ITelegramWebhookStatus | null>(null);

  const [isChecking, setIsChecking] = useState<boolean>(false);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);

  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const closeProfile = useCallback(() => setIsProfileOpen(false), []);

  const { profile, photoUrl, setProfile, setPhoto } = useTelegramBotProfile();

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
          {/* The bot's own photo, as people see it on Telegram; clicking shows it big. */}
          {photoUrl ? (
            <Avatar
              size={72}
              className="shrink-0 cursor-pointer"
              src={<Image src={photoUrl} alt="" preview />}
            />
          ) : (
            <AppTile
              icon={<AppIcon app={AppsEnum.App.TELEGRAM} />}
              accentColor={TELEGRAM_BLUE}
              size={72}
            />
          )}

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

            {profile?.shortDescription && (
              <div
                className="mt-1 truncate"
                style={{ color: token.colorTextSecondary }}
                title={profile.shortDescription}
              >
                {profile.shortDescription}
              </div>
            )}
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

          <Button
            icon={<EditOutlined />}
            disabled={!canManage}
            onClick={() => setIsProfileOpen(true)}
          >
            {t("apps.telegram.editProfile")}
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

      {profile?.description && (
        <Typography.Paragraph
          className="mb-0 mt-4 whitespace-pre-line"
          type="secondary"
          ellipsis={{
            rows: 2,
            expandable: true,
            symbol: t("apps.telegram.profile.more"),
          }}
        >
          {profile.description}
        </Typography.Paragraph>
      )}

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

      <TelegramBotProfileModal
        open={isProfileOpen}
        onClose={closeProfile}
        onSaved={(saved) => {
          setIsProfileOpen(false);
          setProfile(saved);
          onBotNameChanged(saved.name);
        }}
        photoUrl={photoUrl}
        onPhotoChanged={setPhoto}
      />
    </Card>
  );
}
