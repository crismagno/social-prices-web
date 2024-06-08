"use client";

import { Card, Tooltip } from "antd";
import Meta from "antd/es/card/Meta";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { HomeOutlined, PlusOutlined, TabletOutlined } from "@ant-design/icons";

import Urls from "../../../../shared/common/routes-app/routes-app";
import { useFindStoresByUser } from "../../../stores/useFindStoresByUser";

export const StoresCard: React.FC = () => {
  const router: AppRouterInstance = useRouter();

  const { isLoading, stores } = useFindStoresByUser();

  return (
    <Card
      loading={isLoading}
      cover={
        <div
          className="flex flex-col justify-center items-center w-full h-60 
        bg-gradient-to-tr from-gray-700 to-yellow-600 hover:to-gray-800 hover:to-yellow-700 text-white"
        >
          <div className="flex flex-col justify-center items-center w-full h-full">
            <HomeOutlined style={{ fontSize: 50 }} />
          </div>
        </div>
      }
      actions={[
        <Tooltip key="table" title="See Stores">
          <TabletOutlined onClick={() => router.push(Urls.STORES)} />
        </Tooltip>,
        <Tooltip key="plus" title="Create a new Store">
          <PlusOutlined onClick={() => router.push(Urls.NEW_STORE)} />
        </Tooltip>,
      ]}
    >
      <Meta
        avatar={<HomeOutlined style={{ fontSize: 25 }} />}
        title="Stores"
        description={`Total Stores: ${stores.length}`}
      />
    </Card>
  );
};
