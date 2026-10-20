"use client";

import { useState } from "react";

import { Alert, Button, Card, ConfigProvider, theme } from "antd";

import { InstagramOutlined } from "@ant-design/icons";

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
import { INSTAGRAM_PINK } from "./instagram-display";

interface Props {
  canManage: boolean;
  // The 60-day token ran out: the way in is the same, with a reason to take it again.
  isExpired: boolean;
  // Why the last login did not end in a connection, as the callback reported it.
  errorCode: string | null;
}

export default function InstagramConnectCard({
  canManage,
  isExpired,
  errorCode,
}: Props) {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  const handleConnect = async (): Promise<void> => {
    try {
      setIsRedirecting(true);

      const { url } =
        await serviceMethodsInstance.instagramServiceMethods.connect();

      // Instagram's own screen takes over; it brings the user back here.
      window.location.href = url;
    } catch (error: any) {
      handleClientError(error);
      setIsRedirecting(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: INSTAGRAM_PINK } }}>
      <Card>
        <div className="max-w-2xl">
          <ConnectHero
            icon={<AppIcon app={AppsEnum.App.INSTAGRAM} />}
            accentColor={INSTAGRAM_PINK}
            title={t("apps.instagram.connectTitle")}
            subtitle={t("apps.instagram.connectSubtitle")}
          />

          {isExpired && (
            <Alert
              className="mt-6"
              type="warning"
              showIcon
              message={t("apps.instagram.expiredHint")}
            />
          )}

          {errorCode && (
            <Alert
              className="mt-6"
              type="error"
              showIcon
              message={t(`apps.instagram.errors.${errorCode}`)}
            />
          )}

          {!canManage && (
            <Alert
              className="mt-6"
              type="info"
              showIcon
              message={t("apps.instagram.managersOnly")}
            />
          )}

          <ConnectInfoBefore
            prefix="apps.instagram.info"
            accentColor={INSTAGRAM_PINK}
            need={4}
          />

          <ConnectSteps>
            <ConnectStep
              accentColor={INSTAGRAM_PINK}
              position={1}
              title={t("apps.instagram.steps.professional.title")}
            >
              <p
                className="m-0 mb-3"
                style={{ color: token.colorTextSecondary }}
              >
                {t("apps.instagram.steps.professional.text")}
              </p>

              <ConnectStepDetail
                items={stepDetailKeys(
                  t,
                  "apps.instagram.steps.professional.detail",
                  3,
                )}
              />
            </ConnectStep>

            <ConnectStep
              accentColor={INSTAGRAM_PINK}
              position={2}
              title={t("apps.instagram.steps.access.title")}
            >
              <p
                className="m-0 mb-3"
                style={{ color: token.colorTextSecondary }}
              >
                {t("apps.instagram.steps.access.text")}
              </p>

              <ConnectStepDetail
                items={stepDetailKeys(
                  t,
                  "apps.instagram.steps.access.detail",
                  4,
                )}
              />
            </ConnectStep>

            <ConnectStep
              accentColor={INSTAGRAM_PINK}
              position={3}
              title={t("apps.instagram.steps.login.title")}
              isCurrent
              isLast
            >
              <p
                className="m-0 mb-3"
                style={{ color: token.colorTextSecondary }}
              >
                {t("apps.instagram.steps.login.text")}
              </p>

              <ConnectStepDetail
                items={stepDetailKeys(
                  t,
                  "apps.instagram.steps.login.detail",
                  3,
                )}
              />

              <Button
                type="primary"
                size="large"
                icon={<InstagramOutlined />}
                loading={isRedirecting}
                disabled={!canManage}
                onClick={handleConnect}
              >
                {isExpired
                  ? t("apps.instagram.reconnect")
                  : t("apps.instagram.connect")}
              </Button>
            </ConnectStep>
          </ConnectSteps>

          <ConnectInfoAfter
            prefix="apps.instagram.info"
            accentColor={INSTAGRAM_PINK}
            works={4}
            limits={4}
            faq={5}
          />
        </div>
      </Card>
    </ConfigProvider>
  );
}
