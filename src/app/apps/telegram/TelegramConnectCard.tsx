"use client";

import { useState } from "react";

import { Alert, App, Button, Card, ConfigProvider, Input, theme } from "antd";

import { ExportOutlined, LockOutlined, SendOutlined } from "@ant-design/icons";

import {
  ConnectHero,
  ConnectStep,
  ConnectStepText,
  ConnectSteps,
} from "../../../components/common/ConnectSteps/ConnectSteps";
import AppIcon from "../../../components/common/AppIcon/AppIcon";
import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import AppsEnum from "../../../shared/business/apps/apps.enum";
import { ITelegramConnection } from "../../../shared/business/apps/telegram/telegram.types";
import { telegramErrorCode } from "./telegram-display";
import { TELEGRAM_BLUE } from "./telegram-theme";

// What @BotFather hands out: the bot's numeric id, a colon, then the secret.
const TOKEN_FORMAT: RegExp = /^\d{5,}:[A-Za-z0-9_-]{30,}$/;

const KNOWN_ERRORS: string[] = [
  "TELEGRAM_INVALID_TOKEN",
  "TELEGRAM_BOT_ALREADY_CONNECTED",
];

interface Props {
  canManage: boolean;
  onConnected: (connection: ITelegramConnection) => void;
}

export default function TelegramConnectCard({ canManage, onConnected }: Props) {
  const { t } = useLanguageData();

  const { message } = App.useApp();

  const { token: themeToken } = theme.useToken();

  const [token, setToken] = useState<string>("");

  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const trimmed: string = token.trim();

  const isValid: boolean = TOKEN_FORMAT.test(trimmed);

  // Only complain once the person typed something, never on an empty field.
  const showInvalid: boolean = trimmed.length > 0 && !isValid;

  const handleConnect = async (): Promise<void> => {
    try {
      setIsConnecting(true);

      const connection =
        await serviceMethodsInstance.telegramServiceMethods.connect(trimmed);

      setToken("");

      message.success(t("apps.telegram.connectedToast"));

      onConnected(connection);
    } catch (error: any) {
      const code: string | null = telegramErrorCode(error);

      if (code && KNOWN_ERRORS.includes(code)) {
        message.error(t(`apps.telegram.errors.${code}`));
      } else {
        handleClientError(error);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: TELEGRAM_BLUE } }}>
      <Card>
        <div className="max-w-2xl">
          <ConnectHero
            icon={<AppIcon app={AppsEnum.App.TELEGRAM} />}
            accentColor={TELEGRAM_BLUE}
            title={t("apps.telegram.connectTitle")}
            subtitle={t("apps.telegram.connectSubtitle")}
          />

          <ConnectSteps>
            <ConnectStep
              accentColor={TELEGRAM_BLUE}
              position={1}
              title={t("apps.telegram.steps.createBot.title")}
            >
              <p
                className="m-0 mb-3"
                style={{ color: themeToken.colorTextSecondary }}
              >
                {t("apps.telegram.steps.createBot.text")}
              </p>

              <Button
                href="https://t.me/BotFather"
                target="_blank"
                rel="noopener noreferrer"
                icon={<ExportOutlined />}
              >
                {t("apps.telegram.steps.createBot.action")}
              </Button>
            </ConnectStep>

            <ConnectStep
              accentColor={TELEGRAM_BLUE}
              position={2}
              title={t("apps.telegram.steps.copyToken.title")}
            >
              <p
                className="m-0"
                style={{ color: themeToken.colorTextSecondary }}
              >
                {t("apps.telegram.steps.copyToken.text")}
              </p>
            </ConnectStep>

            <ConnectStep
              accentColor={TELEGRAM_BLUE}
              position={3}
              title={t("apps.telegram.steps.paste.title")}
              isCurrent
              isLast
            >
              <p
                className="m-0 mb-3"
                style={{ color: themeToken.colorTextSecondary }}
              >
                {t("apps.telegram.steps.paste.text")}
              </p>

              {!canManage && (
                <Alert
                  className="mb-3"
                  type="info"
                  showIcon
                  message={t("apps.telegram.managersOnly")}
                />
              )}

              <label htmlFor="telegram-bot-token" className="sr-only">
                {t("apps.telegram.tokenLabel")}
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Input.Password
                  id="telegram-bot-token"
                  size="large"
                  className="font-mono sm:max-w-md"
                  autoComplete="off"
                  spellCheck={false}
                  prefix={<LockOutlined />}
                  placeholder={t("apps.telegram.tokenPlaceholder")}
                  status={showInvalid ? "error" : undefined}
                  value={token}
                  disabled={!canManage || isConnecting}
                  onChange={(event) => setToken(event.target.value)}
                  onPressEnter={() => isValid && handleConnect()}
                />

                <Button
                  type="primary"
                  size="large"
                  icon={<SendOutlined />}
                  loading={isConnecting}
                  disabled={!canManage || !isValid}
                  onClick={handleConnect}
                >
                  {t("apps.telegram.connect")}
                </Button>
              </div>

              {showInvalid && (
                <p
                  className="m-0 mt-2 text-sm"
                  role="alert"
                  style={{ color: themeToken.colorError }}
                >
                  {t("apps.telegram.tokenInvalid")}
                </p>
              )}
            </ConnectStep>
          </ConnectSteps>
        </div>
      </Card>
    </ConfigProvider>
  );
}
