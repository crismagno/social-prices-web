"use client";

import { Badge, Card, Skeleton, theme, Tooltip } from "antd";
import Link from "next/link";

import { AppstoreOutlined } from "@ant-design/icons";

import AppIcon from "../../components/common/AppIcon/AppIcon";
import useAppData from "../../data/context/app/useAppData";
import useLanguageData from "../../data/context/language/useLanguageData";
import AppsEnum from "../../shared/business/apps/apps.enum";
import { IAppCatalogItem } from "../../shared/business/apps/apps.types";
import { APP_URLS } from "../../shared/common/routes-app/apps-urls";
import Urls from "../../shared/common/routes-app/routes-app";

// One row, always the same height: the chat below measures where it starts
// once, so this card must not grow when the apps arrive.
const ROW_HEIGHT: number = 44;

// The apps this account can open, one click away from the central chat: each
// with whether it is connected and what waits to be read there, and a way to
// the full list at the end.
export default function ChatsAppsBar() {
  const { t } = useLanguageData();

  const { token } = theme.useToken();

  const {
    apps: { catalog, isLoadingApps },
  } = useAppData();

  // Only what can be opened: enabled by the manager, with a page of its own.
  const apps: IAppCatalogItem[] = catalog.filter(
    (app: IAppCatalogItem) =>
      app.enabled && app.integrated && !!APP_URLS[app.id],
  );

  const statusOf = (app: IAppCatalogItem): string =>
    app.connected
      ? t("apps.status.connected")
      : app.status === AppsEnum.ConnectionStatus.EXPIRED
        ? t("apps.status.expired")
        : t("apps.status.notConnected");

  const chipStyle = {
    height: ROW_HEIGHT - 8,
    border: `1px solid ${token.colorBorderSecondary}`,
    background: token.colorBgContainer,
    color: token.colorText,
  };

  const chipClassName: string =
    "flex shrink-0 items-center gap-2 rounded-full px-3 text-sm transition-shadow hover:shadow-md";

  return (
    <Card className="mb-3" styles={{ body: { padding: "8px 12px" } }}>
      <div
        className="flex items-center gap-2 overflow-x-auto"
        style={{ height: ROW_HEIGHT }}
      >
        <span
          className="shrink-0 pr-1 text-xs font-semibold uppercase tracking-wide"
          style={{ color: token.colorTextTertiary }}
        >
          {t("chats.apps.title")}
        </span>

        {isLoadingApps && apps.length === 0 ? (
          <Skeleton.Button active size="small" style={{ width: 220 }} />
        ) : (
          apps.map((app: IAppCatalogItem) => (
            <Tooltip key={app.id} title={statusOf(app)}>
              <Link
                href={APP_URLS[app.id] as string}
                className={chipClassName}
                style={chipStyle}
              >
                <span className="text-lg leading-none">
                  <AppIcon app={app.id} />
                </span>

                <span className="font-medium">{t(`apps.names.${app.id}`)}</span>

                {/* Connected or not, at a glance; the words are in the tooltip. */}
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{
                    background: app.connected
                      ? token.colorSuccess
                      : token.colorTextQuaternary,
                  }}
                />

                <span className="sr-only">{statusOf(app)}</span>

                {app.unreadCount > 0 && (
                  <Badge
                    count={app.unreadCount}
                    size="small"
                    overflowCount={99}
                    title={t("apps.unread").replace(
                      "{count}",
                      String(app.unreadCount),
                    )}
                  />
                )}
              </Link>
            </Tooltip>
          ))
        )}

        <Link
          href={Urls.APPS}
          className={`${chipClassName} ml-auto`}
          style={{ ...chipStyle, color: token.colorPrimary }}
        >
          <AppstoreOutlined />

          <span className="font-medium">{t("navigation.allApps")}</span>
        </Link>
      </div>
    </Card>
  );
}
