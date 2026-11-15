"use client";

import { useEffect, useState } from "react";

import { Card, Col, Empty, List, Row, Statistic } from "antd";
import moment from "moment";
import Link from "next/link";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import Layout from "../../../components/template/Layout/Layout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import {
  ICustomerPortalDashboard,
  ICustomerPortalSale,
} from "../../../shared/business/customer-portal/customer-portal.types";
import Urls from "../../../shared/common/routes-app/routes-app";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { formatterMoney } from "../../../shared/utils/strings/string";
import { SaleStatusTag, storesNamesOf } from "../sale-tags";

// A customer's overview of what they bought, across every store.
export default function CustomerDashboardPage() {
  const { t } = useLanguageData();

  const [dashboard, setDashboard] = useState<ICustomerPortalDashboard | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    serviceMethodsInstance.customerPortalServiceMethods
      .getDashboard()
      .then(setDashboard)
      .catch(handleClientError)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Layout
      title={t("customerPortal.dashboardTitle")}
      subtitle={t("customerPortal.dashboardSubtitle")}
    >
      <Row gutter={[16, 16]} className="mt-5">
        <Col xs={24} md={8}>
          <Card loading={isLoading}>
            <Statistic
              title={t("customerPortal.totalPurchases")}
              value={dashboard?.totalPurchases ?? 0}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card loading={isLoading}>
            <Statistic
              title={t("customerPortal.totalSpent")}
              value={formatterMoney(dashboard?.totalSpent ?? 0)}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card loading={isLoading}>
            <Statistic
              title={t("customerPortal.openAmount")}
              value={formatterMoney(dashboard?.openAmount ?? 0)}
            />
          </Card>
        </Col>

        <Col xs={24}>
          <Card title={t("customerPortal.lastPurchases")} loading={isLoading}>
            {dashboard?.lastPurchases.length ? (
              <List
                dataSource={dashboard.lastPurchases}
                renderItem={(sale: ICustomerPortalSale) => (
                  <List.Item extra={<SaleStatusTag status={sale.status} />}>
                    <List.Item.Meta
                      title={
                        <Link
                          href={Urls.CUSTOMER_PURCHASE.replace(
                            ":saleId",
                            sale._id,
                          )}
                        >
                          #{sale.number} · {storesNamesOf(sale.storesNames)}
                        </Link>
                      }
                      description={`${moment(sale.createdAt).format(
                        DatesEnum.Format.DDMMYYYYhhmmss,
                      )} · ${formatterMoney(sale.totals?.totalFinalAmount)}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description={t("customerPortal.noPurchases")} />
            )}
          </Card>
        </Col>
      </Row>
    </Layout>
  );
}
