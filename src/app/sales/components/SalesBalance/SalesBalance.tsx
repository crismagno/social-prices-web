import React from "react";

import { Card, Col, Row } from "antd";
import moment from "moment";

import { SalesBalanceStatistic } from "../SalesBalanceStatistic/SalesBalanceStatistic";
import { useGetSalesBalance } from "./useGetSalesBalance";

interface Props {
  className?: string;
}

export const SalesBalance: React.FC<Props> = ({ className }) => {
  const { salesBalance } = useGetSalesBalance({
    rangeDate: {
      endDate: moment().endOf("years").toDate(),
      startDate: moment().startOf("years").toDate(),
    },
  });

  return (
    <Card className={`my-2 ${className}`}>
      <Row gutter={[10, 10]}>
        <Col xs={24} sm={12} md={6}>
          <SalesBalanceStatistic
            title="Last Hour Balance"
            salesBalanceTotals={salesBalance?.lastHour}
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
