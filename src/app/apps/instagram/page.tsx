"use client";

import { ConfigProvider, Empty, Space, Spin } from "antd";
import { useSearchParams } from "next/navigation";

import Layout from "../../../components/template/Layout/Layout";
import useAppData from "../../../data/context/app/useAppData";
import useAuthData from "../../../data/context/auth/useAuthData";
import useLanguageData from "../../../data/context/language/useLanguageData";
import AppsEnum from "../../../shared/business/apps/apps.enum";
import { IAppCatalogItem } from "../../../shared/business/apps/apps.types";
import EmployeesEnum from "../../../shared/business/employees/employees.enum";
import InstagramAccountCard from "./InstagramAccountCard";
import InstagramConnectCard from "./InstagramConnectCard";
import InstagramInbox from "./InstagramInbox";
import { INSTAGRAM_PINK } from "./instagram-display";
import { useInstagramConnection } from "./useInstagramConnection";

export default function InstagramAppPage() {
  const { t } = useLanguageData();

  const { employee } = useAuthData();

  const errorCode: string | null = useSearchParams().get("error");

  const {
    apps: { catalog, isLoadingApps, fetchApps },
  } = useAppData();

  const item: IAppCatalogItem | undefined = catalog.find(
    (app: IAppCatalogItem) => app.id === AppsEnum.App.INSTAGRAM,
  );

  const { connection, isLoadingConnection, setConnection } =
    useInstagramConnection(!!item?.enabled);

  // Connecting and disconnecting the account need an admin or master employee
  // (the API enforces it too). Answering customers is open to every employee.
  const canManage: boolean = employee?.level !== EmployeesEnum.Level.EMPLOYEE;

  const renderBody = () => {
    if ((isLoadingApps && !item) || (isLoadingConnection && !connection)) {
      return <Spin />;
    }

    if (!item?.enabled) {
      return <Empty description={t("apps.notEnabled")} />;
    }

    if (!connection?.connected) {
      return (
        <InstagramConnectCard
          canManage={canManage}
          isExpired={connection?.status === AppsEnum.ConnectionStatus.EXPIRED}
          errorCode={errorCode}
        />
      );
    }

    return (
      <ConfigProvider theme={{ token: { colorPrimary: INSTAGRAM_PINK } }}>
        <Space direction="vertical" size="middle" className="w-full">
          <InstagramAccountCard
            connection={connection}
            canManage={canManage}
            onDisconnected={() => {
              setConnection(null);
              fetchApps();
            }}
          />

          <InstagramInbox isEnabled />
        </Space>
      </ConfigProvider>
    );
  };

  return (
    <Layout title={t("apps.instagram.title")} hasBackButton>
      <div className="mt-4">{renderBody()}</div>
    </Layout>
  );
}
