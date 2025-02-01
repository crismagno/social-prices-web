import React from "react";

import { Card, Col, Row } from "antd";

import { SalesBalanceStatistic } from "../SalesBalanceStatistic/SalesBalanceStatistic";

interface Props {
  className?: string;
}

export const SalesBalance: React.FC<Props> = ({ className }) => {
  return (
    <Card className={`my-2 ${className}`}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <SalesBalanceStatistic title="Last Hour Balance" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <SalesBalanceStatistic title="Day Balance" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <SalesBalanceStatistic title="Month Balance" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <SalesBalanceStatistic title="Annual Balance" />
        </Col>
      </Row>
    </Card>
  );
};
