import React, { useState } from "react";

import { Badge, Button, Card, Col, Divider, Row, Select, Tooltip } from "antd";
import { map } from "lodash";
import moment from "moment";

import { ReloadOutlined } from "@ant-design/icons";

import { ButtonCreateSale } from "../../../../components/common/ButtonCreateSale/ButtonCreateSale";
import { CustomRangeDatePicker } from "../../../../components/common/CustomRangeDatePicker/CustomRangeDatePicker";
import { LabelBadgeCustomAntd } from "../../../../components/common/LabelBadgeCustomAntd/LabelBadgeCustomAntd";
import Loading from "../../../../components/common/Loading/Loading";
import SelectProductItems from "../../../../components/common/SelectProductItems/SelectProductItems";
import SelectProducts from "../../../../components/common/SelectProducts/SelectProducts";
import { StoreNameStatus } from "../../../../components/common/StoreNameStatus/StoreNameStatus";
import { TagTagCustomAntd } from "../../../../components/common/TagTagCustomAntd/TagTagCustomAntd";
import { IProductItem } from "../../../../shared/business/product-items/product-items.interface";
import { IProduct } from "../../../../shared/business/products/products.interface";
import SalesEnum from "../../../../shared/business/sales/sales.enum";
import { IGetSalesAnalyticsParams } from "../../../../shared/business/sales/sales.type";
import { createGetSalesAnalyticsParams } from "../../../../shared/business/sales/sales.utils";
import { IStore } from "../../../../shared/business/stores/stores.interface";
import TagsEnum from "../../../../shared/business/tags/tags.enum";
import { ITag } from "../../../../shared/business/tags/tags.interface";
import ChartsEnum from "../../../../shared/utils/charts/charts-enum";
import DatesEnum from "../../../../shared/utils/dates/dates.enum";
import { useFindStoresByUser } from "../../../stores/useFindStoresByUser";
import { useFindTagsByType } from "../../../tags/useFindTagsByType";
import { useGetSalesAnalytics } from "../../useGetSalesAnalytics";
import { SalesChartListProducts } from "./SalesChartListProducts";
import { SalesChartPeriodType } from "./SalesChartPeriodType";
import { SalesChartProducts } from "./SalesChartProducts";
import { SalesQuantityChartPeriodType } from "./SalesQuantityChartPeriodType";

interface Props {
  title?: string;
  isShowHeader?: boolean;
  isShowButtonCreateSale?: boolean;
  cardClassName?: string;
  customerId?: string;
  storeId?: string;
  productId?: string;
  productItemId?: string;
}

const defaultGetSalesAnalyticsParams = createGetSalesAnalyticsParams({
  periodType: ChartsEnum.PeriodType.MONTH,
  rangeDate: {
    startDate: moment().subtract(6, "month").toDate(),
    endDate: moment().toDate(),
  },
});

export const SalesChart: React.FC<Props> = ({
  title,
  isShowHeader = true,
  isShowButtonCreateSale = false,
  cardClassName,
  customerId,
  storeId,
  productId,
  productItemId,
}) => {
  const [getSalesAnalyticsParams, setGetSalesAnalyticsParams] =
    useState<IGetSalesAnalyticsParams>({
      ...defaultGetSalesAnalyticsParams,
      customerIds: customerId ? [customerId] : undefined,
      storesIds: storeId ? [storeId] : undefined,
      productIds: productId ? [productId] : undefined,
      productItemIds: productItemId ? [productItemId] : undefined,
    });

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
    <Card
      title={title ?? "Sales Chart"}
      extra={isShowButtonCreateSale && <ButtonCreateSale />}
      className={cardClassName}
      headStyle={{ display: isShowHeader ? "" : "none" }}
    >
      <Row gutter={[8, 8]}>
        <Col md={6}>
          <CustomRangeDatePicker
            label="Created Date:"
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

        <Col md={4}>
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
            disabled={!!storeId}
          >
            {map(stores, (store: IStore) => (
              <Select.Option key={store._id} value={store._id}>
                <StoreNameStatus store={store} />
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col md={4}>
          <SelectProducts
            label={"Products"}
            disabled={!!productId}
            selectedProductIds={getSalesAnalyticsParams.productIds ?? []}
            onSelectProducts={(selectProducts: IProduct[]) => {
              setGetSalesAnalyticsParams({
                ...getSalesAnalyticsParams,
                productIds: map(selectProducts, "_id"),
              });
            }}
          />
        </Col>

        <Col md={4}>
          <SelectProductItems
            label={"Product Items"}
            disabled={!!productItemId}
            selectedProductItemIds={
              getSalesAnalyticsParams.productItemIds ?? []
            }
            onSelectProductItems={(selectProductItems: IProductItem[]) => {
              setGetSalesAnalyticsParams({
                ...getSalesAnalyticsParams,
                productItemIds: map(selectProductItems, "_id"),
              });
            }}
          />
        </Col>

        <Col md={3}>
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
            {map(Object.keys(SalesEnum.Type), (type: SalesEnum.Type) => (
              <Select.Option key={type} value={type}>
                {SalesEnum.TypeLabels[type]}
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col md={3}>
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
            {map(Object.keys(SalesEnum.Status), (status: SalesEnum.Status) => (
              <Select.Option key={status} value={status}>
                <span className="mr-1">{SalesEnum.StatusLabels[status]}</span>

                <Badge color={SalesEnum.StatusColors[status]} />
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col md={3}>
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

        <Col md={3}>
          <label className="mr-1 font-bold">Payment Status:</label>
          <Select
            allowClear
            mode="multiple"
            value={getSalesAnalyticsParams.paymentStatus}
            style={{ width: "100%" }}
            onChange={(paymentStatus: SalesEnum.PaymentStatus[]) => {
              setGetSalesAnalyticsParams({
                ...getSalesAnalyticsParams,
                paymentStatus: paymentStatus ?? [],
              });
            }}
          >
            {map(
              Object.keys(SalesEnum.PaymentStatus),
              (paymentStatus: SalesEnum.PaymentStatus) => (
                <Select.Option key={paymentStatus} value={paymentStatus}>
                  <LabelBadgeCustomAntd
                    label={SalesEnum.PaymentStatusLabels[paymentStatus]}
                    color={SalesEnum.PaymentStatusColors[paymentStatus]}
                  />
                </Select.Option>
              )
            )}
          </Select>
        </Col>

        <Col md={3}>
          <label className="mr-1 font-bold">Delivery Type:</label>
          <Select
            allowClear
            mode="multiple"
            value={getSalesAnalyticsParams.deliveryTypes}
            style={{ width: "100%" }}
            onChange={(deliveryTypes: SalesEnum.DeliveryType[]) => {
              setGetSalesAnalyticsParams({
                ...getSalesAnalyticsParams,
                deliveryTypes: deliveryTypes ?? [],
              });
            }}
          >
            {map(
              Object.keys(SalesEnum.DeliveryType),
              (deliveryType: SalesEnum.DeliveryType) => (
                <Select.Option key={deliveryType} value={deliveryType}>
                  {SalesEnum.DeliveryTypeLabels[deliveryType]}
                </Select.Option>
              )
            )}
          </Select>
        </Col>

        <Col md={1}>
          <Tooltip title="Reload filters">
            <Button
              className="mt-5"
              icon={<ReloadOutlined />}
              onClick={() => {
                setGetSalesAnalyticsParams({
                  ...defaultGetSalesAnalyticsParams,
                  customerIds: customerId ? [customerId] : undefined,
                  storesIds: storeId ? [storeId] : undefined,
                  productIds: productId ? [productId] : undefined,
                  productItemIds: productItemId ? [productItemId] : undefined,
                });
              }}
            />
          </Tooltip>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-3">
        <Col md={12}>
          <SalesChartPeriodType
            periodType={getSalesAnalyticsParams.periodType!}
            onChange={(periodType: ChartsEnum.PeriodType) => {
              setGetSalesAnalyticsParams({
                ...getSalesAnalyticsParams,
                periodType,
              });
            }}
            salesAnalytics={salesAnalytics}
          />
        </Col>
        <Col md={12}>
          <SalesQuantityChartPeriodType
            periodType={getSalesAnalyticsParams.periodType!}
            salesAnalytics={salesAnalytics}
          />
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]} className="mt-2">
        <Col md={12}>
          <SalesChartProducts salesAnalytics={salesAnalytics} />
        </Col>

        <Col md={12}>
          <SalesChartListProducts salesAnalytics={salesAnalytics} />
        </Col>
      </Row>
    </Card>
  );
};
