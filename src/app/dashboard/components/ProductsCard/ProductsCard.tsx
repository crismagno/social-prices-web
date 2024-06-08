"use client";

import { Card, Tooltip } from "antd";
import Meta from "antd/es/card/Meta";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import {
  AppstoreOutlined,
  PlusOutlined,
  TabletOutlined,
} from "@ant-design/icons";

import Urls from "../../../../shared/common/routes-app/routes-app";
import { useCountProductsByUser } from "../../../products/useCountProductsByUser";

export const ProductsCard: React.FC = () => {
  const router: AppRouterInstance = useRouter();

  const { isLoading, count } = useCountProductsByUser();

  return (
    <Card
      loading={isLoading}
      cover={
        <div
          className="flex flex-col justify-center items-center w-full h-60 
            bg-gradient-to-tr from-green-700 to-blue-500 
          hover:from-green-800 hover:to-blue-600 text-white"
        >
          <div className="flex flex-col justify-center items-center w-full h-full">
            <AppstoreOutlined style={{ fontSize: 50 }} />
          </div>
        </div>
      }
      actions={[
        <Tooltip key="table" title="See Products">
          <TabletOutlined onClick={() => router.push(Urls.PRODUCTS)} />
        </Tooltip>,
        <Tooltip key="plus" title="Create a new Product">
          <PlusOutlined onClick={() => router.push(Urls.NEW_PRODUCT)} />
        </Tooltip>,
      ]}
    >
      <Meta
        avatar={<AppstoreOutlined style={{ fontSize: 25 }} />}
        title="Products"
        description={`Total Products: ${count}`}
      />
    </Card>
  );
};
