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
import MessengerConnectCard from "./MessengerConnectCard";
import MessengerInbox from "./MessengerInbox";
import MessengerPageCard from "./MessengerPageCard";
import { MESSENGER_BLUE } from "./messenger-display";
import { useMessengerConnection } from "./useMessengerConnection";

export default function MessengerAppPage() {
  const { t } = useLanguageData();

  const { employee } = useAuthData();

  const errorCode: string | null = useSearchParams().get("error");

  const {
    apps: { catalog, isLoadingApps, fetchApps },
  } = useAppData();

  const item: IAppCatalogItem | undefined = catalog.find(
    (app: IAppCatalogItem) => app.id === AppsEnum.App.FACEBOOK,
  );

  const { connection, isLoadingConnection, setConnection } =
    useMessengerConnection(!!item?.enabled);

  // Connecting and disconnecting the Page need an admin or master employee (the
  // API enforces it too). Answering customers is open to every employee.
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
        <MessengerConnectCard
          canManage={canManage}
          errorCode={errorCode}
          pendingPages={connection?.pendingPages ?? []}
          onConnected={(connected) => {
            setConnection(connected);
            fetchApps();
          }}
        />
      );
    }

    return (
      <ConfigProvider theme={{ token: { colorPrimary: MESSENGER_BLUE } }}>
        <Space direction="vertical" size="middle" className="w-full">
          <MessengerPageCard
            connection={connection}
            canManage={canManage}
            onDisconnected={() => {
              setConnection(null);
              fetchApps();
            }}
          />

          <MessengerInbox isEnabled canDelete={canManage} />
        </Space>
      </ConfigProvider>
    );
  };

  return (
    <Layout title={t("apps.messenger.title")} hasBackButton>
      <div className="mt-4">{renderBody()}</div>
    </Layout>
  );
}
