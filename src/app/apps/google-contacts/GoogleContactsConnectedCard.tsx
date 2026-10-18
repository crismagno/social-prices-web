"use client";

import {
  Alert,
  Badge,
  Button,
  Card,
  ConfigProvider,
  Divider,
  Popconfirm,
  theme,
} from "antd";
import dayjs from "dayjs";

import { SyncOutlined } from "@ant-design/icons";

import { AppTile } from "../../../components/common/ConnectSteps/ConnectSteps";
import GoogleColorIcon from "../../../components/common/GoogleColorIcon/GoogleColorIcon";
import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IGoogleContactsConnection,
  IGoogleContactsImportResult,
} from "../../../shared/business/apps/google-contacts/google-contacts.types";
import { formatCountdown } from "../../../shared/utils/google-contacts-cache/google-contacts-cache";

// Google's blue. It carries the brand on this screen's main action.
const GOOGLE_BLUE: string = "#4285F4";

const RESULT_KEYS = ["created", "linked", "skipped", "failed"] as const;

interface Props {
  connection: IGoogleContactsConnection;
  // The result of the last time contacts were saved, if there was one.
  summary: IGoogleContactsImportResult | null;
  // When the list in the browser came from Google (epoch ms).
  fetchedAt: number | null;
  cooldownRemainingMs: number;
  canManage: boolean;
  isSyncing: boolean;
  isDisconnecting: boolean;
  // Something else on the page is running (saving, connecting...).
  isBusy: boolean;
  onSync: () => void;
  onDisconnect: () => void;
}

// Who is connected, what the last save did, and the two actions of the app:
// bring the contacts from Google, or disconnect.
export default function GoogleContactsConnectedCard({
  connection,
  summary,
  fetchedAt,
  cooldownRemainingMs,
  canManage,
  isSyncing,
  isDisconnecting,
  isBusy,
  onSync,
  onDisconnect,
}: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  return (
    <ConfigProvider theme={{ token: { colorPrimary: GOOGLE_BLUE } }}>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <AppTile
              icon={<GoogleColorIcon />}
              accentColor={GOOGLE_BLUE}
              size={56}
            />

            <div className="min-w-0">
              <h2 className="m-0 text-xl font-semibold leading-tight">
                {t("apps.names.GOOGLE_CONTACTS")}
              </h2>

              <div className="mt-1 flex items-center gap-2">
                <Badge status="success" />

                <span
                  className="truncate"
                  style={{ color: token.colorTextSecondary }}
                >
                  {t("apps.google.connectedAs").replace(
                    "{account}",
                    connection.googleEmail ?? "",
                  )}
                </span>
              </div>
            </div>
          </div>

          <Popconfirm
            title={t("apps.google.disconnectConfirm")}
            onConfirm={onDisconnect}
            disabled={!canManage}
          >
            <Button
              type="primary"
              danger
              loading={isDisconnecting}
              disabled={!canManage || isBusy}
            >
              {t("apps.google.disconnect")}
            </Button>
          </Popconfirm>
        </div>

        <Divider className="my-4" />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-3">
            <div>
              <div
                className="text-sm"
                style={{ color: token.colorTextSecondary }}
              >
                {t("apps.google.lastSync")}
              </div>

              <div className="font-medium">
                {connection.lastImportAt
                  ? dayjs(connection.lastImportAt).format("DD/MM/YYYY HH:mm")
                  : t("apps.google.never")}
              </div>
            </div>

            {summary && (
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                {RESULT_KEYS.map((key) => (
                  <div key={key} className="flex items-baseline gap-1.5">
                    <span
                      className="text-lg font-semibold"
                      style={{
                        color:
                          key === "failed" && summary.failed > 0
                            ? token.colorError
                            : undefined,
                      }}
                    >
                      {summary[key]}
                    </span>

                    <span
                      className="text-sm"
                      style={{ color: token.colorTextSecondary }}
                    >
                      {t(`apps.google.result.${key}`)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-start gap-1 sm:items-end">
            <Button
              type="primary"
              size="large"
              icon={<SyncOutlined />}
              loading={isSyncing}
              disabled={!canManage || isBusy || cooldownRemainingMs > 0}
              onClick={onSync}
            >
              {t("apps.google.sync")}
            </Button>

            {fetchedAt !== null && (
              <span
                className="text-xs"
                style={{ color: token.colorTextSecondary }}
              >
                {t("apps.google.fetchedAt").replace(
                  "{time}",
                  dayjs(fetchedAt).format("DD/MM/YYYY HH:mm"),
                )}
              </span>
            )}

            {cooldownRemainingMs > 0 && (
              <span
                className="text-xs"
                style={{ color: token.colorTextSecondary }}
              >
                {t("apps.google.cooldown").replace(
                  "{time}",
                  formatCountdown(cooldownRemainingMs),
                )}
              </span>
            )}
          </div>
        </div>

        {summary?.limitReached && (
          <Alert
            className="mt-4"
            type="warning"
            showIcon
            message={t("apps.google.limitReached")}
          />
        )}
      </Card>
    </ConfigProvider>
  );
}
