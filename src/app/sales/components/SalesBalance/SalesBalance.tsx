import React, { useState } from "react";

import { Card, Col, Row } from "antd";
import moment from "moment";

import { IGetSalesBalanceParams } from "../../../../shared/business/sales/sales.type";
import { SalesBalanceStatistic } from "../SalesBalanceStatistic/SalesBalanceStatistic";
import { useGetSalesBalance } from "./useGetSalesBalance";

interface Props {
  className?: string;
}

export const SalesBalance: React.FC<Props> = ({ className }) => {
  const [salesBalanceParams] = useState<IGetSalesBalanceParams>({
    rangeDate: {
      endDate: moment().endOf("years").toDate(),
      startDate: moment().startOf("years").toDate(),
    },
  });

  const { salesBalance, isLoading } = useGetSalesBalance(salesBalanceParams);

  return (
    <Card className={`my-2 ${className}`} loading={isLoading}>
      <Row gutter={[10, 10]}>
        <Col xs={24} sm={12} md={6}>
          <SalesBalanceStatistic
            title="Hour Balance"
            salesBalanceTotals={salesBalance?.hour}
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <SalesBalanceStatistic
            title="Day Balance"
            salesBalanceTotals={salesBalance?.day}
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <SalesBalanceStatistic
            title="Month Balance"
            salesBalanceTotals={salesBalance?.month}
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <SalesBalanceStatistic
            title="Annual Balance"
            salesBalanceTotals={salesBalance?.annual}
          />
        </Col>
      </Row>
    </Card>
  );
};
