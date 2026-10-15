"use client";

import { useRouter } from "next/navigation";

import { Card, Empty, Spin, Tag } from "antd";

import AppIcon from "../../components/common/AppIcon/AppIcon";
import Layout from "../../components/template/Layout/Layout";
import useAppData from "../../data/context/app/useAppData";
import useLanguageData from "../../data/context/language/useLanguageData";
import AppsEnum from "../../shared/business/apps/apps.enum";
import { IAppCatalogItem } from "../../shared/business/apps/apps.types";
import Urls from "../../shared/common/routes-app/routes-app";

// Only apps with an integration page are listed here; the rest are "coming soon".
const APP_URLS: Partial<Record<AppsEnum.App, string>> = {
  [AppsEnum.App.GOOGLE_CONTACTS]: Urls.APPS_GOOGLE_CONTACTS,
};

export default function AppsPage() {
  const { t } = useLanguageData();

  const router = useRouter();

  const {
    apps: { catalog, isLoadingApps },
  } = useAppData();

  const enabledApps: IAppCatalogItem[] = catalog.filter(
    (app: IAppCatalogItem) => app.enabled,
  );

  return (
    <Layout title={t("apps.title")} subtitle={t("apps.subtitle")}>
      {isLoadingApps ? (
        <Spin />
      ) : enabledApps.length === 0 ? (
        <Empty description={t("apps.noneEnabled")} />
      ) : (
        <div className="flex flex-col gap-4">
          {enabledApps.map((app: IAppCatalogItem) => {
            const url: string | undefined = app.integrated
              ? APP_URLS[app.id]
              : undefined;

            return (
              <Card
                key={app.id}
                hoverable={!!url}
                onClick={() => url && router.push(url)}
                className={url ? "cursor-pointer" : "opacity-70"}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    <AppIcon app={app.id} />
                  </span>

                  <div className="flex flex-col items-start gap-1">
                    <span className="font-semibold">
                      {t(`apps.names.${app.id}`)}
                    </span>

                    {url ? (
                      <Tag color={app.connected ? "green" : "default"}>
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
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
