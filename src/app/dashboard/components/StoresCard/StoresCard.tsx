"use client";

import { Card, Tooltip } from "antd";
import Meta from "antd/es/card/Meta";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";

import { PlusOutlined, ShopOutlined, TabletOutlined } from "@ant-design/icons";

import useLanguageData from "../../../../data/context/language/useLanguageData";
import Urls from "../../../../shared/common/routes-app/routes-app";
import { useFindStoresByUser } from "../../../stores/useFindStoresByUser";

export const StoresCard: React.FC = () => {
  const router: AppRouterInstance = useRouter();
  const { t } = useLanguageData();

  const { isLoading, stores } = useFindStoresByUser();

  const handleGoToStores = () => {
    router.push(Urls.STORES);
  };

  return (
    <Card
      loading={isLoading}
      cover={
        <div
          onClick={handleGoToStores}
          className="flex flex-col justify-center items-center w-full h-60 
          cursor-pointer
        bg-gradient-to-tr from-gray-700 to-yellow-600 hover:to-gray-800 hover:to-yellow-700 text-white"
        >
          <div className="flex flex-col justify-center items-center w-full h-full">
            <ShopOutlined style={{ fontSize: 50 }} />
          </div>
        </div>
      }
      actions={[
        <Tooltip key="table" title={t("dashboard.seeStores")}>
          <TabletOutlined onClick={handleGoToStores} />
        </Tooltip>,
        <Tooltip key="plus" title={t("dashboard.createNewStore")}>
          <PlusOutlined onClick={() => router.push(Urls.NEW_STORE)} />
        </Tooltip>,
      ]}
    >
      <Meta
        avatar={<ShopOutlined style={{ fontSize: 25 }} />}
        title={t("dashboard.stores")}
        description={`${t("dashboard.totalStores")}: ${stores.length}`}
      />
    </Card>
  );
};
