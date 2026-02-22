import React, { useState } from "react";

import { Card, Col, Divider, Radio, Row } from "antd";
import moment from "moment";

import { DotChartOutlined, LineChartOutlined } from "@ant-design/icons";

import ChartsEnum from "../../../../shared/utils/charts/charts-enum";
import { SalesChartStatistic } from "./SalesChartStatistic";

interface Props {
  className?: string;
  storeId?: string;
  customerId?: string;
  employeeId?: string;
  isShowHeader?: boolean;
  isShowHeaderLabel?: boolean;
}

export const SalesChartsStatistics: React.FC<Props> = ({
  className,
  storeId,
  customerId,
  employeeId,
  isShowHeader = true,
  isShowHeaderLabel = true,
}) => {
  const [isSalesQuantityMode, setIsSalesQuantityMode] =
    useState<boolean>(false);

  return (
    <Card
      className={`my-2 ${className}`}
      title={
        <div className="flex items-center">
          {isShowHeaderLabel && <h2 className="mr-3">Sales Statistics:</h2>}

          <Radio.Group
            onChange={(e) => {
              setIsSalesQuantityMode(e.target.value);
            }}
            value={isSalesQuantityMode}
          >
            <Radio.Button value={false}>
              <LineChartOutlined />
              <span className="ml-1">Amount</span>
            </Radio.Button>

            <Radio.Button value={true}>
              <DotChartOutlined />
              <span className="ml-1">Quantity</span>
            </Radio.Button>
          </Radio.Group>
        </div>
      }
      styles={{ header: { display: isShowHeader ? "" : "none" } }}
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
            customerId={customerId}
            employeeId={employeeId}
            title={
              isSalesQuantityMode
                ? "Sales quantity of day per hour"
                : "Sales amount of day per hour"
            }
            isSalesQuantityMode={isSalesQuantityMode}
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
            customerId={customerId}
            employeeId={employeeId}
            title={
              isSalesQuantityMode
                ? "Sales quantity of month per day"
                : "Sales amount of month per day"
            }
            isSalesQuantityMode={isSalesQuantityMode}
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
            customerId={customerId}
            employeeId={employeeId}
            title={
              isSalesQuantityMode
                ? "Sales quantity of year per month"
                : "Sales amount of year per month"
            }
            isSalesQuantityMode={isSalesQuantityMode}
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
            customerId={customerId}
            employeeId={employeeId}
            title={
              isSalesQuantityMode
                ? "Sales quantity of year per last 6 years"
                : "Sales amount of year per last 6 years"
            }
            isSalesQuantityMode={isSalesQuantityMode}
          />

          <Divider type="horizontal" />
        </Col>
      </Row>
    </Card>
  );
};
