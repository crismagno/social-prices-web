"use client";

import { ConfigProvider, Empty, Space, Spin } from "antd";

import Layout from "../../../components/template/Layout/Layout";
import useAppData from "../../../data/context/app/useAppData";
import useAuthData from "../../../data/context/auth/useAuthData";
import useLanguageData from "../../../data/context/language/useLanguageData";
import AppsEnum from "../../../shared/business/apps/apps.enum";
import { IAppCatalogItem } from "../../../shared/business/apps/apps.types";
import EmployeesEnum from "../../../shared/business/employees/employees.enum";
import InboxEnum from "../../../shared/business/inbox/inbox.enum";
import ChatsInbox from "../../chats/ChatsInbox";
import WhatsappAccountCard from "./WhatsappAccountCard";
import WhatsappConnectCard from "./WhatsappConnectCard";
import { WHATSAPP_GREEN } from "./whatsapp-display";
import { useWhatsappConnection } from "./useWhatsappConnection";

export default function WhatsappAppPage() {
  const { t } = useLanguageData();

  const { employee } = useAuthData();

  const {
    apps: { catalog, isLoadingApps, fetchApps },
  } = useAppData();

  const item: IAppCatalogItem | undefined = catalog.find(
    (app: IAppCatalogItem) => app.id === AppsEnum.App.WHATSAPP,
  );

  const { connection, isLoadingConnection, setConnection } =
    useWhatsappConnection(!!item?.enabled);

  // Connecting and disconnecting the number need an admin or master employee
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
        <WhatsappConnectCard
          canManage={canManage}
          isRevoked={connection?.status === AppsEnum.ConnectionStatus.REVOKED}
          onConnected={(connected) => {
            setConnection(connected);
            fetchApps(true);
          }}
        />
      );
    }

    return (
      <ConfigProvider theme={{ token: { colorPrimary: WHATSAPP_GREEN } }}>
        <Space direction="vertical" size="middle" className="w-full">
          <WhatsappAccountCard
            connection={connection}
            canManage={canManage}
            onDisconnected={() => {
              setConnection(null);
              fetchApps(true);
            }}
          />

          <ChatsInbox channel={InboxEnum.Channel.WHATSAPP} />
        </Space>
      </ConfigProvider>
    );
  };

  return (
    <Layout title={t("apps.whatsapp.title")} hasBackButton>
      <div className="mt-4">{renderBody()}</div>
    </Layout>
  );
}
