import React, { useState } from "react";

import { Card, Col, Row } from "antd";
import moment from "moment";

import { IGetSalesBalanceParams } from "../../../../shared/business/sales/sales.type";
import { SalesBalanceStatistic } from "../SalesBalanceStatistic/SalesBalanceStatistic";
import { useGetSalesBalance } from "./useGetSalesBalance";

interface Props {
  className?: string;
  storeId?: string;
}

export const SalesBalance: React.FC<Props> = ({ className, storeId }) => {
  const [salesBalanceParams] = useState<IGetSalesBalanceParams>({
    rangeDate: {
      endDate: moment().endOf("years").toDate(),
      startDate: moment().startOf("years").toDate(),
    },
    storeId,
  });

  const { salesBalance, isLoading } = useGetSalesBalance(salesBalanceParams);

  return (
    <Card
      className={`my-2 ${className}`}
      loading={isLoading}
      title="Sales Balance"
    >
      <Row gutter={[10, 10]}>
        <Col xs={24} sm={12} md={6}>
          <SalesBalanceStatistic
            title="Hour Balance"
            storeId={storeId}
            salesBalanceTotals={salesBalance?.hour}
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <SalesBalanceStatistic
            title="Day Balance"
            storeId={storeId}
            salesBalanceTotals={salesBalance?.day}
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <SalesBalanceStatistic
            title="Month Balance"
            storeId={storeId}
            salesBalanceTotals={salesBalance?.month}
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <SalesBalanceStatistic
            title="Annual Balance"
            storeId={storeId}
            salesBalanceTotals={salesBalance?.annual}
          />
        </Col>
      </Row>
    </Card>
  );
};
