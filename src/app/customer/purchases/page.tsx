"use client";

import { useEffect, useMemo, useState } from "react";

import { Button, Card, Col, Row, Tooltip } from "antd";
import moment from "moment";
import Link from "next/link";

import { EnterOutlined } from "@ant-design/icons";

import { CustomRangeDatePicker } from "../../../components/common/CustomRangeDatePicker/CustomRangeDatePicker";
import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import TableCustomAntd2 from "../../../components/custom/antd/TableCustomAntd2/TableCustomAntd2";
import Layout from "../../../components/template/Layout/Layout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import {
  ICustomerPortalSale,
  ICustomerPortalStore,
} from "../../../shared/business/customer-portal/customer-portal.types";
import { ISale } from "../../../shared/business/sales/sale.interface";
import SalesEnum from "../../../shared/business/sales/sales.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { formatterMoney } from "../../../shared/utils/strings/string";
import { createTableState } from "../../../shared/utils/table/table-state";
import { ITableStateRequest } from "../../../shared/utils/table/table-state.interface";
import {
  SalePaymentStatusTag,
  SaleStatusTag,
  storesNamesOf,
} from "../sale-tags";

// Every purchase made for this customer, from any store. Read only.
export default function CustomerPurchasesPage() {
  const { t } = useLanguageData();

  const [tableStateRequest, setTableStateRequest] = useState<
    ITableStateRequest<ICustomerPortalSale> | undefined
  >(createTableState({ sort: { field: "createdAt", order: "descend" } }));

  const [sales, setSales] = useState<ICustomerPortalSale[]>([]);

  const [total, setTotal] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [stores, setStores] = useState<ICustomerPortalStore[]>([]);

  // Kept apart from the table state: the table replaces its filters on every
  // change, which would drop the period.
  const [rangeDate, setRangeDate] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);

  const request = useMemo<ITableStateRequest<ICustomerPortalSale> | undefined>(
    () =>
      tableStateRequest && {
        ...tableStateRequest,
        filters: { ...tableStateRequest.filters, rangeDate },
      },
    [tableStateRequest, rangeDate],
  );

  useEffect(() => {
    serviceMethodsInstance.customerPortalServiceMethods
      .findStores()
      .then(setStores)
      .catch(handleClientError);
  }, []);

  useEffect(() => {
    setIsLoading(true);

    serviceMethodsInstance.customerPortalServiceMethods
      .findSalesTableState(request)
      .then((response) => {
        setSales(response.data);
        setTotal(response.total);
      })
      .catch(handleClientError)
      .finally(() => setIsLoading(false));
  }, [request]);

  return (
    <Layout
      title={t("customerPortal.purchasesTitle")}
      subtitle={t("customerPortal.purchasesSubtitle")}
    >
      <Card className="mt-5">
        <Row gutter={[16, 16]} className="mb-2">
          <Col xs={24} md={10}>
            <CustomRangeDatePicker
              label={t("customerPortal.period")}
              labelClassName="mr-3"
              onChange={(startDate: Date | null, endDate: Date | null) => {
                setRangeDate(
                  startDate && endDate ? { startDate, endDate } : null,
                );
                // Back to the first page: the old page may not exist anymore.
                setTableStateRequest(
                  (current) =>
                    current && {
                      ...current,
                      pagination: {
                        ...current.pagination,
                        current: 1,
                        skip: 0,
                      },
                    },
                );
              }}
            />
          </Col>
        </Row>

        <TableCustomAntd2<ICustomerPortalSale>
          rowKey={"_id"}
          dataSource={sales}
          loading={isLoading}
          tableStateRequest={tableStateRequest}
          setTableStateRequest={setTableStateRequest}
          total={total}
          search={{ placeholder: t("customerPortal.searchByNumber") }}
          scroll={{ x: "max-content" }}
          columns={[
            {
              title: t("customerPortal.number"),
              dataIndex: "number",
              key: "number",
              align: "center",
              sorter: true,
            },
            {
              title: t("customerPortal.date"),
              dataIndex: "createdAt",
              key: "createdAt",
              align: "center",
              sorter: true,
              render: (createdAt: Date) =>
                moment(createdAt).format(DatesEnum.Format.DDMMYYYYhhmmss),
            },
            {
              title: t("customerPortal.stores"),
              dataIndex: "storesNames",
              // The key names the filter sent to the API.
              key: "stores",
              align: "center",
              filters: stores.map((store: ICustomerPortalStore) => ({
                value: store._id,
                text: store.name,
              })),
              render: (storesNames: Record<string, string | null>) =>
                storesNamesOf(storesNames),
            },
            {
              title: t("customerPortal.total"),
              dataIndex: "totals",
              key: "totals",
              align: "center",
              render: (totals: ISale["totals"]) =>
                formatterMoney(totals?.totalFinalAmount),
            },
            {
              title: t("customerPortal.status"),
              dataIndex: "status",
              key: "status",
              align: "center",
              filters: Object.values(SalesEnum.Status).map((status) => ({
                value: status,
                text: t(SalesEnum.StatusLabels[status]),
              })),
              render: (status: SalesEnum.Status) => (
                <SaleStatusTag status={status} />
              ),
            },
            {
              title: t("customerPortal.paymentStatus"),
              dataIndex: "paymentStatus",
              key: "paymentStatus",
              align: "center",
              filters: Object.values(SalesEnum.PaymentStatus).map((status) => ({
                value: status,
                text: t(SalesEnum.PaymentStatusLabels[status]),
              })),
              render: (paymentStatus: SalesEnum.PaymentStatus) => (
                <SalePaymentStatusTag paymentStatus={paymentStatus} />
              ),
            },
            {
              title: t("common.actions"),
              dataIndex: "action",
              key: "action",
              align: "center",
              fixed: "right",
              render: (_: any, sale: ICustomerPortalSale) => (
                <Tooltip title={t("customerPortal.openPurchase")}>
                  <Link
                    href={Urls.CUSTOMER_PURCHASE.replace(":saleId", sale._id)}
                  >
                    <Button icon={<EnterOutlined />} />
                  </Link>
                </Tooltip>
              ),
            },
          ]}
        />
      </Card>
    </Layout>
  );
}
