"use client";

import { ConfigProvider, Empty, Space, Spin } from "antd";

import Layout from "../../../components/template/Layout/Layout";
import useAppData from "../../../data/context/app/useAppData";
import useAuthData from "../../../data/context/auth/useAuthData";
import useLanguageData from "../../../data/context/language/useLanguageData";
import AppsEnum from "../../../shared/business/apps/apps.enum";
import { IAppCatalogItem } from "../../../shared/business/apps/apps.types";
import EmployeesEnum from "../../../shared/business/employees/employees.enum";
import TelegramBotCard from "./TelegramBotCard";
import TelegramConnectCard from "./TelegramConnectCard";
import TelegramInbox from "./TelegramInbox";
import { TELEGRAM_BLUE } from "./telegram-theme";
import { useTelegramConnection } from "./useTelegramConnection";

export default function TelegramAppPage() {
  const { t } = useLanguageData();

  const { employee } = useAuthData();

  const {
    apps: { catalog, isLoadingApps, fetchApps },
  } = useAppData();

  const item: IAppCatalogItem | undefined = catalog.find(
    (app: IAppCatalogItem) => app.id === AppsEnum.App.TELEGRAM,
  );

  const { connection, isLoadingConnection, setConnection } =
    useTelegramConnection(!!item?.enabled);

  // Connecting and disconnecting the bot need an admin or master employee (the
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
        <TelegramConnectCard
          canManage={canManage}
          onConnected={(connected) => {
            setConnection(connected);
            fetchApps();
          }}
        />
      );
    }

    return (
      <ConfigProvider theme={{ token: { colorPrimary: TELEGRAM_BLUE } }}>
        <Space direction="vertical" size="middle" className="w-full">
          <TelegramBotCard
            connection={connection}
            canManage={canManage}
            onDisconnected={() => {
              setConnection(null);
              fetchApps();
            }}
          />

          <TelegramInbox
            isEnabled
            botUsername={connection.botUsername}
            canDelete={canManage}
          />
        </Space>
      </ConfigProvider>
    );
  };

  return (
    <Layout title={t("apps.telegram.title")} hasBackButton>
      <div className="mt-4">{renderBody()}</div>
    </Layout>
  );
}
