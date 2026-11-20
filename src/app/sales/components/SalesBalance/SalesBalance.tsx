import React, { useState } from 'react';

import {
  Card,
  Col,
  Row,
} from 'antd';
import moment from 'moment';

import {
  BarChartOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  RiseOutlined,
} from '@ant-design/icons';

import useLanguageData from '../../../../data/context/language/useLanguageData';
import {
  IGetSalesBalanceParams,
} from '../../../../shared/business/sales/sales.type';
import { SalesBalanceStatistic } from './SalesBalanceStatistic';
import { useGetSalesBalance } from './useGetSalesBalance';

interface Props {
  className?: string;
  storeId?: string;
  customerId?: string;
  productId?: string;
  productItemId?: string;
  employeeId?: string;
}

export const SalesBalance: React.FC<Props> = ({
  className,
  storeId,
  customerId,
  productId,
  productItemId,
  employeeId,
}) => {
  const { t } = useLanguageData();
  const [salesBalanceParams] = useState<IGetSalesBalanceParams>({
    rangeDate: {
      endDate: moment().endOf("years").toDate(),
      startDate: moment().startOf("years").toDate(),
    },
    storeId,
    customerId,
    productIds: productId ? [productId] : [],
    productItemIds: productItemId ? [productItemId] : [],
    employeeIds: employeeId ? [employeeId] : [],
  });

  const { salesBalance, isLoading } = useGetSalesBalance(salesBalanceParams);

  return (
    <Card
      className={`my-2 ${className}`}
      loading={isLoading}
      title={t("sales.salesBalance")}
    >
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} xl={6}>
          <SalesBalanceStatistic
            title={t("sales.hourBalance")}
            icon={<ClockCircleOutlined />}
            iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
            storeId={storeId}
            customerId={customerId}
            salesBalanceTotals={salesBalance?.hour}
          />
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <SalesBalanceStatistic
            title={t("sales.dayBalance")}
            icon={<CalendarOutlined />}
            iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
            storeId={storeId}
            customerId={customerId}
            salesBalanceTotals={salesBalance?.day}
          />
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <SalesBalanceStatistic
            title={t("sales.monthBalance")}
            icon={<BarChartOutlined />}
            iconClassName="bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
            storeId={storeId}
            customerId={customerId}
            salesBalanceTotals={salesBalance?.month}
          />
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <SalesBalanceStatistic
            title={t("sales.annualBalance")}
            icon={<RiseOutlined />}
            iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
            storeId={storeId}
            customerId={customerId}
            salesBalanceTotals={salesBalance?.annual}
          />
        </Col>
      </Row>
    </Card>
  );
};
