"use client";

import { Alert, Button, Card, ConfigProvider } from "antd";

import {
  ConnectInfoAfter,
  ConnectInfoBefore,
  stepDetailKeys,
} from "../../../components/common/ConnectSteps/ConnectInfoSections";
import {
  ConnectHero,
  ConnectStep,
  ConnectStepDetail,
  ConnectStepText,
  ConnectSteps,
} from "../../../components/common/ConnectSteps/ConnectSteps";
import GoogleColorIcon from "../../../components/common/GoogleColorIcon/GoogleColorIcon";
import useLanguageData from "../../../data/context/language/useLanguageData";

// Google's blue. It carries the brand on the markers of this one screen.
const GOOGLE_BLUE: string = "#4285F4";

interface Props {
  // The connection expired: the way in is the same, with a reason to take it again.
  isExpired: boolean;
  canManage: boolean;
  isConnecting: boolean;
  // Something else on the page is running (disconnecting, saving...).
  isBusy: boolean;
  onConnect: () => void;
}

export default function GoogleContactsConnectCard({
  isExpired,
  canManage,
  isConnecting,
  isBusy,
  onConnect,
}: Props) {
  const { t } = useLanguageData();

  return (
    <ConfigProvider theme={{ token: { colorPrimary: GOOGLE_BLUE } }}>
      <Card>
        <div className="max-w-2xl">
          <ConnectHero
            icon={<GoogleColorIcon />}
            accentColor={GOOGLE_BLUE}
            title={t("apps.google.connectTitle")}
            subtitle={t("apps.google.connectSubtitle")}
          />

          {isExpired && (
            <Alert
              className="mt-6"
              type="warning"
              showIcon
              message={t("apps.google.expiredHint")}
            />
          )}

          {!canManage && (
            <Alert
              className="mt-6"
              type="info"
              showIcon
              message={t("apps.google.managersOnly")}
            />
          )}

          <ConnectInfoBefore
            prefix="apps.google.info"
            accentColor={GOOGLE_BLUE}
            need={3}
          />

          <ConnectSteps>
            <ConnectStep
              position={1}
              accentColor={GOOGLE_BLUE}
              title={t("apps.google.steps.signIn.title")}
              isCurrent
            >
              <ConnectStepText>
                {t("apps.google.steps.signIn.text")}
              </ConnectStepText>

              {/* White with the colored G: how Google asks its sign-in button to look. */}
              <Button
                size="large"
                icon={<GoogleColorIcon />}
                loading={isConnecting}
                disabled={!canManage || isBusy}
                onClick={onConnect}
              >
                {isExpired
                  ? t("apps.google.reconnect")
                  : t("apps.google.signIn")}
              </Button>
            </ConnectStep>

            <ConnectStep
              position={2}
              accentColor={GOOGLE_BLUE}
              title={t("apps.google.steps.allow.title")}
            >
              <ConnectStepText>
                {t("apps.google.steps.allow.text")}
              </ConnectStepText>

              <ConnectStepDetail
                items={stepDetailKeys(t, "apps.google.steps.allow.detail", 3)}
              />
            </ConnectStep>

            <ConnectStep
              position={3}
              accentColor={GOOGLE_BLUE}
              title={t("apps.google.steps.choose.title")}
              isLast
            >
              <ConnectStepText>
                {t("apps.google.steps.choose.text")}
              </ConnectStepText>
            </ConnectStep>
          </ConnectSteps>

          <ConnectInfoAfter
            prefix="apps.google.info"
            accentColor={GOOGLE_BLUE}
            works={3}
            limits={3}
            faq={5}
          />
        </div>
      </Card>
    </ConfigProvider>
  );
}
