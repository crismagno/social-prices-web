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
  AppstoreOutlined,
  PlusOutlined,
  TabletOutlined,
} from '@ant-design/icons';

import {
  formatFeatureLimitReached,
  isFeatureLimitReached,
  useFeaturesUsage,
} from '../../../../components/common/FeatureUsageBadge/useFeaturesUsage';
import useLanguageData from '../../../../data/context/language/useLanguageData';
import Urls from '../../../../shared/common/routes-app/routes-app';
import {
  useCountProductsByUser,
} from '../../../products/useCountProductsByUser';

export const ProductsCard: React.FC = () => {
  const router: AppRouterInstance = useRouter();
  const { t } = useLanguageData();

  const { usage } = useFeaturesUsage();

  const isLimitReached: boolean = isFeatureLimitReached(usage, 'products');

  const { isLoading, count } = useCountProductsByUser();

  const handleGoToProducts = () => {
    router.push(Urls.PRODUCTS);
  };

  return (
    <Card
      loading={isLoading}
      cover={
        <div
          onClick={handleGoToProducts}
          className="flex flex-col justify-center items-center w-full h-60 
          cursor-pointer
            bg-gradient-to-tr from-green-700 to-blue-500 
          hover:from-green-800 hover:to-blue-600 text-white"
        >
          <div className="flex flex-col justify-center items-center w-full h-full">
            <AppstoreOutlined style={{ fontSize: 50 }} />
          </div>
        </div>
      }
      actions={[
        <Tooltip key="table" title={t("dashboard.seeProducts")}>
          <TabletOutlined onClick={handleGoToProducts} />
        </Tooltip>,
        <Tooltip
          key="plus"
          title={
            isLimitReached
              ? formatFeatureLimitReached(t, 'products', usage)
              : t("dashboard.createNewProduct")
          }
        >
          <PlusOutlined
            style={
              isLimitReached ? { opacity: 0.4, cursor: 'not-allowed' } : undefined
            }
            onClick={
              isLimitReached ? undefined : () => router.push(Urls.NEW_PRODUCT)
            }
          />
        </Tooltip>,
      ]}
    >
      <Meta
        avatar={<AppstoreOutlined style={{ fontSize: 25 }} />}
        title={t("dashboard.products")}
        description={`${t("dashboard.totalProducts")}: ${count}`}
      />
    </Card>
  );
};
