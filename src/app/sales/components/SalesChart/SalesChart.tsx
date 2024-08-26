import React, { useState } from "react";

import { Card, Col, Row, Select } from "antd";
import { map } from "lodash";
import moment from "moment";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CustomRangeDatePicker } from "../../../../components/common/CustomRangeDatePicker/CustomRangeDatePicker";
import Loading from "../../../../components/common/Loading/Loading";
import { IGetSalesAnalyticsParams } from "../../../../services/social-prices-api/sales/sales-service.types";
import { createGetSalesAnalyticsParams } from "../../../../services/social-prices-api/sales/sales-service.utils";
import { IRangeDate } from "../../../../shared/common/interfaces/global";
import ChartsEnum from "../../../../shared/utils/charts/charts-enum";
import { useGetSalesAnalytics } from "../../useGetSalesAnalytics";

interface Props {
  title?: string;
}

const defaultRangeDate = (): IRangeDate => ({
  startDate: moment().startOf("year").toDate(),
  endDate: moment().toDate(),
});

export const SalesChart: React.FC<Props> = ({ title }) => {
  const [getSalesAnalyticsParams, setGetSalesAnalyticsParams] =
    useState<IGetSalesAnalyticsParams>(
      createGetSalesAnalyticsParams({
        periodType: ChartsEnum.PeriodType.MONTH,
        rangeDate: defaultRangeDate(),
      })
    );

  const { isLoading, salesAnalytics } = useGetSalesAnalytics(
    getSalesAnalyticsParams
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Card title={title ?? "Sales Chart"} className="mt-5">
      <Row gutter={[8, 8]}>
        <Col md={3}>
          <label className="mr-2 font-bold">Period type:</label>

          <Select
            style={{ width: 100 }}
            value={getSalesAnalyticsParams.periodType}
            defaultValue={ChartsEnum.PeriodType.MONTH}
            onChange={(periodType: ChartsEnum.PeriodType) => {
              setGetSalesAnalyticsParams({
                ...getSalesAnalyticsParams,
                periodType,
              });
            }}
          >
            {map(
              Object.keys(ChartsEnum.PeriodType),
              (periodType: ChartsEnum.PeriodType) => (
                <Select.Option value={periodType}>
                  {ChartsEnum.PeriodTypeLabel[periodType]}
                </Select.Option>
              )
            )}
          </Select>
        </Col>

        <Col md={8}>
          <CustomRangeDatePicker
            label="Created At:"
            showTime
            onChange={(startDate: Date | null, endDate: Date | null) => {
              setGetSalesAnalyticsParams({
                ...getSalesAnalyticsParams,
                rangeDate: {
                  startDate: startDate ?? moment().startOf("year").toDate(),
                  endDate: endDate ?? moment().toDate(),
                },
              });
            }}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <ResponsiveContainer width={800} height={400}>
            <AreaChart
              width={500}
              height={400}
              data={salesAnalytics?.chartDataPeriodType}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#8884d8"
                fill="#8884d8"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    </Card>
  );
};
