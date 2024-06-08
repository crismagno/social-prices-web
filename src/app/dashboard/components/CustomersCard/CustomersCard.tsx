"use client";

import { Card, Tooltip } from "antd";
import Meta from "antd/es/card/Meta";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { PlusOutlined, TabletOutlined, TeamOutlined } from "@ant-design/icons";

import Urls from "../../../../shared/common/routes-app/routes-app";
import { useCountCustomersByUser } from "../../../customers/useCountCustomersByUser";

export const CustomersCard: React.FC = () => {
  const router: AppRouterInstance = useRouter();

  const { isLoading, count } = useCountCustomersByUser();

  return (
    <Card
      loading={isLoading}
      cover={
        <div
          className="flex flex-col justify-center items-center w-full h-60 
            bg-gradient-to-tr from-pink-700 to-blue-500 
            hover:from-pink-800 hover:to-blue-600 text-white"
        >
          <div className="flex flex-col justify-center items-center w-full h-full">
            <TeamOutlined style={{ fontSize: 50 }} />
          </div>
        </div>
      }
      actions={[
        <Tooltip key="table" title="See Customers">
          <TabletOutlined onClick={() => router.push(Urls.CUSTOMERS)} />
        </Tooltip>,
        <Tooltip key="plus" title="Create a new Customer">
          <PlusOutlined onClick={() => router.push(Urls.NEW_CUSTOMER)} />
        </Tooltip>,
      ]}
    >
      <Meta
        avatar={<TeamOutlined style={{ fontSize: 25 }} />}
        title="Customers"
        description={`Total Customers: ${count}`}
      />
    </Card>
  );
};
