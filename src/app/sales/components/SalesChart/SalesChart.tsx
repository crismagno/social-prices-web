import React, { useState } from "react";

import { Badge, Card, Col, Row, Select } from "antd";
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
import { TagTagCustomAntd } from "../../../../components/common/TagTagCustomAntd/TagTagCustomAntd";
import { IGetSalesAnalyticsParams } from "../../../../services/social-prices-api/sales/sales-service.types";
import { createGetSalesAnalyticsParams } from "../../../../services/social-prices-api/sales/sales-service.utils";
import SalesEnum from "../../../../shared/business/sales/sales.enum";
import { IStore } from "../../../../shared/business/stores/stores.interface";
import TagsEnum from "../../../../shared/business/tags/tags.enum";
import { ITag } from "../../../../shared/business/tags/tags.interface";
import { IRangeDate } from "../../../../shared/common/interfaces/global";
import ChartsEnum from "../../../../shared/utils/charts/charts-enum";
import DatesEnum from "../../../../shared/utils/dates/dates.enum";
import { useFindStoresByUser } from "../../../stores/useFindStoresByUser";
import { useFindTagsByType } from "../../../tags/useFindTagsByType";
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

  const { stores, isLoading: isLoadingStores } = useFindStoresByUser();

  const { tags, isLoading: isLoadingTags } = useFindTagsByType(
    TagsEnum.Type.SALE
  );

  if (isLoading || isLoadingStores || isLoadingTags) {
    return <Loading />;
  }

  return (
    <Card title={title ?? "Sales Chart"} className="mt-5">
      <Row gutter={[8, 8]}>
        <Col md={6}>
          <CustomRangeDatePicker
            label="Created At:"
            showTime
            defaultValue={[
              moment(getSalesAnalyticsParams?.rangeDate?.startDate),
              moment(getSalesAnalyticsParams?.rangeDate?.endDate),
            ]}
            format={DatesEnum.Format.DDMMYYYYhhmmss}
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

        <Col md={6}>
          <label className="mr-1 font-bold">Stores:</label>
          <Select
            allowClear
            mode="multiple"
            value={getSalesAnalyticsParams.storesIds}
            style={{ width: "100%" }}
            onChange={(storesIds: string[]) => {
              setGetSalesAnalyticsParams({
                ...getSalesAnalyticsParams,
                storesIds: storesIds ?? [],
              });
            }}
          >
            {stores.map((store: IStore) => (
              <Select.Option key={store._id} value={store._id}>
                {store.name}
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col md={4}>
          <label className="mr-1 font-bold">Types:</label>
          <Select
            allowClear
            mode="multiple"
            value={getSalesAnalyticsParams.types}
            style={{ width: "100%" }}
            onChange={(types: SalesEnum.Type[]) => {
              setGetSalesAnalyticsParams({
                ...getSalesAnalyticsParams,
                types: types ?? [],
              });
            }}
          >
            {map(Object.keys(SalesEnum.Type), (type: string) => (
              <Select.Option key={type} value={type}>
                {SalesEnum.TypeLabels[type as SalesEnum.Type]}
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col md={4}>
          <label className="mr-1 font-bold">Status:</label>
          <Select
            allowClear
            mode="multiple"
            value={getSalesAnalyticsParams.status}
            style={{ width: "100%" }}
            onChange={(status: SalesEnum.Status[]) => {
              setGetSalesAnalyticsParams({
                ...getSalesAnalyticsParams,
                status: status ?? [],
              });
            }}
          >
            {map(Object.keys(SalesEnum.Status), (status: string) => (
              <Select.Option key={status} value={status}>
                <span className="mr-1">
                  {SalesEnum.StatusLabels[status as SalesEnum.Status]}
                </span>

                <Badge
                  color={SalesEnum.StatusColors[status as SalesEnum.Status]}
                />
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col md={4}>
          <label className="mr-1 font-bold">Tags:</label>
          <Select
            allowClear
            mode="multiple"
            value={getSalesAnalyticsParams.tagsIds}
            style={{ width: "100%" }}
            onChange={(tagsIds: string[]) => {
              setGetSalesAnalyticsParams({
                ...getSalesAnalyticsParams,
                tagsIds: tagsIds ?? [],
              });
            }}
          >
            {map(tags, (tag: ITag) => (
              <Select.Option key={tag._id} value={tag._id}>
                <TagTagCustomAntd tag={tag} useTag={false} />
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Row gutter={[8, 8]} className="mt-3">
        <Col md={3}>
          <label className="mr-1 font-bold">Period type:</label>

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
                <Select.Option key={periodType} value={periodType}>
                  {ChartsEnum.PeriodTypeLabel[periodType]}
                </Select.Option>
              )
            )}
          </Select>
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
                stroke="#1677FE"
                fill="#1677FE"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    </Card>
  );
};
