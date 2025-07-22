import React from "react";

import { Card, Col, Divider, Row } from "antd";
import moment from "moment";

import ChartsEnum from "../../../../shared/utils/charts/charts-enum";
import { SalesChartStatistic } from "./SalesChartStatistic";

interface Props {
  className?: string;
  storeId?: string;
  isShowHeader?: boolean;
}

export const SalesChartsStatistics: React.FC<Props> = ({
  className,
  storeId,
  isShowHeader = true,
}) => {
  return (
    <Card
      className={`my-2 ${className}`}
      title="Sales Statistics"
      headStyle={{ display: isShowHeader ? "" : "none" }}
    >
      <Row gutter={[2, 2]}>
        <Col xs={24} sm={24} md={12}>
          <SalesChartStatistic
            periodType={ChartsEnum.PeriodType.HOUR}
            rangeDate={{
              endDate: moment().endOf("day").toDate(),
              startDate: moment().startOf("day").toDate(),
            }}
            chartProps={{
              height: 300,
            }}
            storeId={storeId}
            title={"Sales of day per hour"}
          />

          <Divider type="horizontal" />
        </Col>

        <Col xs={24} sm={24} md={12}>
          <SalesChartStatistic
            periodType={ChartsEnum.PeriodType.DAY}
            rangeDate={{
              endDate: moment().endOf("month").toDate(),
              startDate: moment().startOf("month").toDate(),
            }}
            chartProps={{
              height: 300,
            }}
            storeId={storeId}
            title={"Sales of month per day"}
          />

          <Divider type="horizontal" />
        </Col>

        <Col xs={24} sm={24} md={12}>
          <SalesChartStatistic
            periodType={ChartsEnum.PeriodType.MONTH}
            rangeDate={{
              endDate: moment().endOf("year").toDate(),
              startDate: moment().startOf("year").toDate(),
            }}
            chartProps={{
              height: 300,
            }}
            storeId={storeId}
            title={"Sales of year per month"}
          />

          <Divider type="horizontal" />
        </Col>

        <Col xs={24} sm={24} md={12}>
          <SalesChartStatistic
            periodType={ChartsEnum.PeriodType.YEAR}
            rangeDate={{
              startDate: moment().subtract(6, "year").toDate(),
              endDate: moment().toDate(),
            }}
            chartProps={{
              height: 300,
            }}
            storeId={storeId}
            title={"Sales of year per last 6 years"}
          />

          <Divider type="horizontal" />
        </Col>
      </Row>
    </Card>
  );
};
