"use client";

import { useRouter } from "next/navigation";

import { Badge, Card, Empty, Spin, Tag, Tooltip } from "antd";

import { LockOutlined } from "@ant-design/icons";

import AppIcon from "../../components/common/AppIcon/AppIcon";
import Layout from "../../components/template/Layout/Layout";
import useAppData from "../../data/context/app/useAppData";
import useLanguageData from "../../data/context/language/useLanguageData";
import AppsEnum from "../../shared/business/apps/apps.enum";
import { IAppCatalogItem } from "../../shared/business/apps/apps.types";
import { APP_URLS } from "../../shared/common/routes-app/apps-urls";

export default function AppsPage() {
  const { t } = useLanguageData();

  const router = useRouter();

  const {
    apps: { catalog, isLoadingApps },
  } = useAppData();

  // Every app is listed. The ones the manager enabled come first, those that
  // already work before the "coming soon" ones; the ones not enabled come last,
  // locked. Within each group the order stays the catalog's (the sort is stable).
  const rank = (app: IAppCatalogItem): number =>
    !app.enabled ? 2 : app.integrated ? 0 : 1;

  const apps: IAppCatalogItem[] = [...catalog].sort(
    (a: IAppCatalogItem, b: IAppCatalogItem) => rank(a) - rank(b),
  );

  return (
    <Layout title={t("apps.title")} subtitle={t("apps.subtitle")}>
      {isLoadingApps ? (
        <Spin />
      ) : apps.length === 0 ? (
        <Empty description={t("apps.noneEnabled")} />
      ) : (
        <div className="flex flex-col gap-4">
          {apps.map((app: IAppCatalogItem) => {
            // Only an app the manager enabled can be opened.
            const url: string | undefined =
              app.enabled && app.integrated ? APP_URLS[app.id] : undefined;

            return (
              <Tooltip
                key={app.id}
                title={app.enabled ? undefined : t("apps.notEnabledHint")}
              >
                <div>
                  <Card
                    hoverable={!!url}
                    onClick={() => url && router.push(url)}
                    className={
                      url
                        ? "cursor-pointer"
                        : app.enabled
                          ? "opacity-70"
                          : "cursor-not-allowed opacity-50"
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        <AppIcon app={app.id} />
                      </span>

                      <div className="flex flex-col items-start gap-1">
                        <span className="font-semibold">
                          {t(`apps.names.${app.id}`)}
                        </span>

                        {!app.enabled ? (
                          <Tag className="m-0" icon={<LockOutlined />}>
                            {t("apps.notEnabledTag")}
                          </Tag>
                        ) : url ? (
                          <Tag
                            color={app.connected ? "green" : "default"}
                            className="m-0"
                          >
                            {app.connected
                              ? t("apps.status.connected")
                              : app.status === AppsEnum.ConnectionStatus.EXPIRED
                                ? t("apps.status.expired")
                                : t("apps.status.notConnected")}
                          </Tag>
                        ) : (
                          <Tag>{t("apps.comingSoon")}</Tag>
                        )}
                      </div>

                      {app.enabled && app.unreadCount > 0 && (
                        <Badge
                          className="ml-auto"
                          count={app.unreadCount}
                          overflowCount={99}
                          title={t("apps.unread").replace(
                            "{count}",
                            String(app.unreadCount),
                          )}
                        />
                      )}
                    </div>
                  </Card>
                </div>
              </Tooltip>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
