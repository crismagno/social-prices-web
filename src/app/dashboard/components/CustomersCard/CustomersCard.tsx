"use client";

import {
  Card,
  Tooltip,
} from 'antd';
import Meta from 'antd/es/card/Meta';
import {
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';

import {
  PlusOutlined,
  TabletOutlined,
  TeamOutlined,
} from '@ant-design/icons';

import useLanguageData from '../../../../data/context/language/useLanguageData';
import Urls from '../../../../shared/common/routes-app/routes-app';
import {
  useCountCustomersByUser,
} from '../../../customers/useCountCustomersByUser';

export const CustomersCard: React.FC = () => {
  const router: AppRouterInstance = useRouter();
  const { t } = useLanguageData();

  const { isLoading, count } = useCountCustomersByUser();

  const handleGoToCustomers = () => {
    router.push(Urls.CUSTOMERS);
  };

  return (
    <Card
      loading={isLoading}
      cover={
        <div
          onClick={handleGoToCustomers}
          className="flex flex-col justify-center items-center w-full h-60 
          cursor-pointer
            bg-gradient-to-tr from-pink-700 to-blue-500 
            hover:from-pink-800 hover:to-blue-600 text-white"
        >
          <div className="flex flex-col justify-center items-center w-full h-full">
            <TeamOutlined style={{ fontSize: 50 }} />
          </div>
        </div>
      }
      actions={[
        <Tooltip key="table" title={t("dashboard.seeCustomers")}>
          <TabletOutlined onClick={handleGoToCustomers} />
        </Tooltip>,
        <Tooltip key="plus" title={t("dashboard.createNewCustomer")}>
          <PlusOutlined onClick={() => router.push(Urls.NEW_CUSTOMER)} />
        </Tooltip>,
      ]}
    >
      <Meta
        avatar={<TeamOutlined style={{ fontSize: 25 }} />}
        title={t("dashboard.customers")}
        description={`${t("dashboard.totalCustomers")}: ${count}`}
      />
    </Card>
  );
};
