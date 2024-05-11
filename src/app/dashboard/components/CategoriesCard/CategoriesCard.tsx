"use client";

import { Card, Tooltip } from "antd";
import Meta from "antd/es/card/Meta";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { BlockOutlined, TabletOutlined } from "@ant-design/icons";

import Urls from "../../../../shared/common/routes-app/routes-app";
import { useCountCategoriesByUser } from "../../../categories/useCountCategoriesByUser";

interface Props {}

export const CategoriesCard: React.FC<Props> = ({}) => {
  const router: AppRouterInstance = useRouter();

  const { isLoading, count } = useCountCategoriesByUser();

  return (
    <Card
      loading={isLoading}
      cover={
        <div
          className="flex flex-col justify-center items-center w-full h-60 
        bg-gradient-to-tr from-slate-600 to-pink-600 hover:to-slate-800 hover:to-pink-700 text-white"
        >
          <div className="flex flex-col justify-center items-center w-full h-full">
            <BlockOutlined style={{ fontSize: 50 }} />
          </div>
        </div>
      }
      actions={[
        <Tooltip key="table" title="See Categories">
          <TabletOutlined onClick={() => router.push(Urls.CATEGORIES)} />
        </Tooltip>,
      ]}
    >
      <Meta
        avatar={<BlockOutlined style={{ fontSize: 25 }} />}
        title="Categories"
        description={`Total Categories: ${count}`}
      />
    </Card>
  );
};
