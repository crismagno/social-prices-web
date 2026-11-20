import React, { useState } from 'react';

import {
  Card,
  Col,
  Row,
  Segmented,
} from 'antd';
import moment from 'moment';

import {
  BarChartOutlined,
  LineChartOutlined,
} from '@ant-design/icons';

import useLanguageData from '../../../../data/context/language/useLanguageData';
import ChartsEnum from '../../../../shared/utils/charts/charts-enum';
import { SalesChartStatistic } from './SalesChartStatistic';

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
  const { t } = useLanguageData();
  const [isSalesQuantityMode, setIsSalesQuantityMode] =
    useState<boolean>(false);

  return (
    <Card
      className={`my-2 ${className}`}
      title={
        <div className="flex items-center">
          {isShowHeaderLabel && (
            <h2 className="mr-3">{t("sales.salesStatistics")}</h2>
          )}

          <Segmented<boolean>
            value={isSalesQuantityMode}
            onChange={setIsSalesQuantityMode}
            options={[
              {
                label: t("sales.amount"),
                value: false,
                icon: <LineChartOutlined />,
              },
              {
                label: t("sales.quantity"),
                value: true,
                icon: <BarChartOutlined />,
              },
            ]}
          />
        </div>
      }
      styles={{ header: { display: isShowHeader ? "" : "none" } }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <SalesChartStatistic
            periodType={ChartsEnum.PeriodType.HOUR}
            rangeDate={{
              endDate: moment().endOf("day").toDate(),
              startDate: moment().startOf("day").toDate(),
            }}
            chartProps={{
              height: 240,
            }}
            storeId={storeId}
            customerId={customerId}
            employeeId={employeeId}
            title={
              isSalesQuantityMode
                ? t("sales.salesQuantityOfDayPerHour")
                : t("sales.salesAmountOfDayPerHour")
            }
            isSalesQuantityMode={isSalesQuantityMode}
          />
        </Col>

        <Col xs={24} lg={12}>
          <SalesChartStatistic
            periodType={ChartsEnum.PeriodType.DAY}
            rangeDate={{
              endDate: moment().endOf("month").toDate(),
              startDate: moment().startOf("month").toDate(),
            }}
            chartProps={{
              height: 240,
            }}
            storeId={storeId}
            customerId={customerId}
            employeeId={employeeId}
            title={
              isSalesQuantityMode
                ? t("sales.salesQuantityOfMonthPerDay")
                : t("sales.salesAmountOfMonthPerDay")
            }
            isSalesQuantityMode={isSalesQuantityMode}
          />
        </Col>

        <Col xs={24} lg={12}>
          <SalesChartStatistic
            periodType={ChartsEnum.PeriodType.MONTH}
            rangeDate={{
              endDate: moment().endOf("year").toDate(),
              startDate: moment().startOf("year").toDate(),
            }}
            chartProps={{
              height: 240,
            }}
            storeId={storeId}
            customerId={customerId}
            employeeId={employeeId}
            title={
              isSalesQuantityMode
                ? t("sales.salesQuantityOfYearPerMonth")
                : t("sales.salesAmountOfYearPerMonth")
            }
            isSalesQuantityMode={isSalesQuantityMode}
          />
        </Col>

        <Col xs={24} lg={12}>
          <SalesChartStatistic
            periodType={ChartsEnum.PeriodType.YEAR}
            rangeDate={{
              startDate: moment().subtract(6, "year").toDate(),
              endDate: moment().toDate(),
            }}
            chartProps={{
              height: 240,
            }}
            storeId={storeId}
            customerId={customerId}
            employeeId={employeeId}
            title={
              isSalesQuantityMode
                ? t("sales.salesQuantityOfYearPerLastYears")
                : t("sales.salesAmountOfYearPerLastYears")
            }
            isSalesQuantityMode={isSalesQuantityMode}
          />
        </Col>
      </Row>
    </Card>
  );
};
