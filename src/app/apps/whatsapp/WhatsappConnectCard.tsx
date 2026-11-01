"use client";

import { useState } from "react";

import { Alert, App, Button, Card, ConfigProvider, theme } from "antd";

import { WhatsAppOutlined } from "@ant-design/icons";

import AppIcon from "../../../components/common/AppIcon/AppIcon";
import {
  ConnectInfoAfter,
  ConnectInfoBefore,
  stepDetailKeys,
} from "../../../components/common/ConnectSteps/ConnectInfoSections";
import {
  ConnectHero,
  ConnectStep,
  ConnectStepDetail,
  ConnectSteps,
} from "../../../components/common/ConnectSteps/ConnectSteps";
import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import AppsEnum from "../../../shared/business/apps/apps.enum";
import { IWhatsappConnection } from "../../../shared/business/apps/whatsapp/whatsapp.types";
import { WHATSAPP_GREEN } from "./whatsapp-display";
import { SignupCancelledError, useEmbeddedSignup } from "./useEmbeddedSignup";

interface Props {
  canManage: boolean;
  // Meta stopped accepting the token: the way in is the same, with a reason to take it again.
  isRevoked: boolean;
  onConnected: (connection: IWhatsappConnection) => void;
}

export default function WhatsappConnectCard({
  canManage,
  isRevoked,
  onConnected,
}: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const { message } = App.useApp();

  const { start } = useEmbeddedSignup();

  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const handleConnect = async (): Promise<void> => {
    try {
      setIsConnecting(true);

      const config =
        await serviceMethodsInstance.whatsappServiceMethods.getConnectConfig();

      // Facebook's own window takes over; it ends with a code and the ids chosen.
      const result = await start(config);

      onConnected(
        await serviceMethodsInstance.whatsappServiceMethods.connect(result),
      );
    } catch (error: any) {
      if (error instanceof SignupCancelledError) {
        message.info(t("apps.whatsapp.cancelled"));
      } else {
        handleClientError(error);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const step = (key: "business" | "number" | "login", detailCount: number) => ({
    title: t(`apps.whatsapp.steps.${key}.title`),
    text: t(`apps.whatsapp.steps.${key}.text`),
    items: stepDetailKeys(t, `apps.whatsapp.steps.${key}.detail`, detailCount),
  });

  const steps = [step("business", 3), step("number", 3), step("login", 3)];

  return (
    <ConfigProvider theme={{ token: { colorPrimary: WHATSAPP_GREEN } }}>
      <Card>
        <div className="max-w-2xl">
          <ConnectHero
            icon={<AppIcon app={AppsEnum.App.WHATSAPP} />}
            accentColor={WHATSAPP_GREEN}
            title={t("apps.whatsapp.connectTitle")}
            subtitle={t("apps.whatsapp.connectSubtitle")}
          />

          {isRevoked && (
            <Alert
              className="mt-6"
              type="warning"
              showIcon
              message={t("apps.whatsapp.revokedHint")}
            />
          )}

          {!canManage && (
            <Alert
              className="mt-6"
              type="info"
              showIcon
              message={t("apps.whatsapp.managersOnly")}
            />
          )}

          <ConnectInfoBefore
            prefix="apps.whatsapp.info"
            accentColor={WHATSAPP_GREEN}
            need={4}
          />

          <ConnectSteps>
            {steps.map((item, index: number) => (
              <ConnectStep
                key={item.title}
                accentColor={WHATSAPP_GREEN}
                position={index + 1}
                title={item.title}
                isCurrent={index === steps.length - 1}
                isLast={index === steps.length - 1}
              >
                <p
                  className="m-0 mb-3"
                  style={{ color: token.colorTextSecondary }}
                >
                  {item.text}
                </p>

                <ConnectStepDetail items={item.items} />

                {index === steps.length - 1 && (
                  <Button
                    type="primary"
                    size="large"
                    icon={<WhatsAppOutlined />}
                    loading={isConnecting}
                    disabled={!canManage}
                    onClick={handleConnect}
                  >
                    {isRevoked
                      ? t("apps.whatsapp.reconnect")
                      : t("apps.whatsapp.connect")}
                  </Button>
                )}
              </ConnectStep>
            ))}
          </ConnectSteps>

          <ConnectInfoAfter
            prefix="apps.whatsapp.info"
            accentColor={WHATSAPP_GREEN}
            works={4}
            limits={4}
            faq={5}
          />
        </div>
      </Card>
    </ConfigProvider>
  );
}
