"use client";

import { ReactNode, useEffect, useState } from "react";

import { Avatar, Col, Empty, Row, Skeleton } from "antd";
import moment from "moment";
import Link from "next/link";

import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  WalletOutlined,
} from "@ant-design/icons";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import Layout from "../../../components/template/Layout/Layout";
import useAuthData from "../../../data/context/auth/useAuthData";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import {
  ICustomerPortalDashboard,
  ICustomerPortalSale,
} from "../../../shared/business/customer-portal/customer-portal.types";
import Urls from "../../../shared/common/routes-app/routes-app";
import DatesEnum from "../../../shared/utils/dates/dates.enum";
import { getImageUrl } from "../../../shared/utils/images/images-url";
import ImagesEnum from "../../../shared/utils/images/images.enum";
import { getLocale } from "../../../shared/utils/locales/locales";
import {
  formatterMoney,
  getUserName,
} from "../../../shared/utils/strings/string";
import {
  SalePaymentStatusTag,
  SaleStatusTag,
  storesNamesOf,
} from "../sale-tags";

const MAX_PRODUCT_THUMBS: number = 3;

interface IStatTile {
  key: string;
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  iconClassName: string;
}

const getGreetingKey = (hour: number): string => {
  if (hour < 12) {
    return "dashboard.goodMorning";
  }

  if (hour < 18) {
    return "dashboard.goodAfternoon";
  }

  return "dashboard.goodEvening";
};

// The pictures of what was bought, one per product, in the order of the sale.
const productsImagesOf = (sale: ICustomerPortalSale): string[] => {
  const productsIds: string[] = (sale.stores ?? []).flatMap((store) =>
    (store.products ?? []).map((product) => product.productId),
  );

  return Array.from(new Set(productsIds)).map((productId: string) => {
    const image: string | null | undefined = sale.productsImages?.[productId];

    return image
      ? getImageUrl(image)
      : ImagesEnum.FilesNames.DefaultProductImage;
  });
};

// A customer's overview of what they bought, across every store.
export default function CustomerDashboardPage() {
  const { t, language } = useLanguageData();

  const { user } = useAuthData();

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

  const now: Date = new Date();

  const today: string = now.toLocaleDateString(getLocale(language), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const userName: string = user ? getUserName(user) : "";

  const openAmount: number = dashboard?.openAmount ?? 0;

  const hasOpenAmount: boolean = openAmount > 0;

  const tiles: IStatTile[] = [
    {
      key: "totalPurchases",
      label: t("customerPortal.totalPurchases"),
      value: String(dashboard?.totalPurchases ?? 0),
      hint: t("customerPortal.totalPurchasesHint"),
      icon: <ShoppingOutlined />,
      iconClassName:
        "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
    },
    {
      key: "totalSpent",
      label: t("customerPortal.totalSpent"),
      value: formatterMoney(dashboard?.totalSpent ?? 0),
      hint: t("customerPortal.totalSpentHint"),
      icon: <WalletOutlined />,
      iconClassName:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
    },
    {
      key: "openAmount",
      label: t("customerPortal.openAmount"),
      value: formatterMoney(openAmount),
      hint: hasOpenAmount
        ? t("customerPortal.openAmountHint")
        : t("customerPortal.nothingOpen"),
      icon: hasOpenAmount ? <ClockCircleOutlined /> : <CheckCircleOutlined />,
      iconClassName: hasOpenAmount
        ? "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
        : "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
    },
  ];

  const lastPurchases: ICustomerPortalSale[] = dashboard?.lastPurchases ?? [];

  return (
    <Layout
      title={t("customerPortal.dashboardTitle")}
      subtitle={t("customerPortal.dashboardSubtitle")}
    >
      <section className="mt-5">
        <div
          className="flex flex-wrap items-center justify-between gap-4
            rounded-xl px-6 py-5 text-white
            bg-gradient-to-r from-slate-800 via-blue-800 to-blue-600
            shadow-md shadow-blue-900/20"
        >
          <div className="min-w-0">
            <h2 className="m-0 text-2xl font-semibold truncate">
              {t(getGreetingKey(now.getHours()))}
              {userName ? `, ${userName}` : ""}
            </h2>

            <p className="m-0 mt-1 text-sm text-blue-100 first-letter:uppercase">
              {today}
            </p>
          </div>

          <Link
            href={Urls.CUSTOMER_PURCHASES}
            className="flex items-center gap-2 h-10 px-4 rounded-lg shrink-0
              text-sm font-medium bg-white text-blue-700
              hover:bg-blue-50 hover:text-blue-800 transition-colors"
          >
            <ShoppingOutlined className="text-base" />
            {t("customerPortal.purchasesTitle")}
          </Link>
        </div>

        <Row gutter={[12, 12]} className="mt-3">
          {tiles.map((tile: IStatTile) => (
            <Col key={tile.key} xs={24} md={8}>
              <div
                className="h-full rounded-xl border p-4
                  bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center justify-center shrink-0
                      w-11 h-11 rounded-lg text-xl ${tile.iconClassName}`}
                  >
                    {tile.icon}
                  </span>

                  <span className="text-sm truncate text-gray-500 dark:text-gray-400">
                    {tile.label}
                  </span>
                </div>

                <div className="mt-4 h-9 flex items-center">
                  {isLoading ? (
                    <Skeleton.Button active size="small" />
                  ) : (
                    <span
                      className="text-3xl font-semibold leading-none tabular-nums
                        truncate text-slate-800 dark:text-white"
                    >
                      {tile.value}
                    </span>
                  )}
                </div>

                <span className="mt-3 block text-xs text-gray-400">
                  {tile.hint}
                </span>
              </div>
            </Col>
          ))}
        </Row>

        <div
          className="mt-3 rounded-xl border overflow-hidden
            bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
        >
          <div
            className="flex items-center justify-between gap-3 px-5 py-4
              border-b border-gray-100 dark:border-gray-700"
          >
            <h3 className="m-0 text-base font-semibold text-slate-800 dark:text-white">
              {t("customerPortal.lastPurchases")}
            </h3>

            {lastPurchases.length > 0 && (
              <Link
                href={Urls.CUSTOMER_PURCHASES}
                className="flex items-center gap-1 text-xs
                  text-gray-400 hover:text-blue-500 transition-colors"
              >
                {t("customerPortal.seeAllPurchases")}
                <ArrowRightOutlined className="text-[10px]" />
              </Link>
            )}
          </div>

          {isLoading && (
            <div className="px-5 py-4">
              <Skeleton active paragraph={{ rows: 4 }} title={false} />
            </div>
          )}

          {!isLoading && lastPurchases.length === 0 && (
            <div className="px-5 py-10">
              <Empty
                description={
                  <>
                    <span className="block text-slate-700 dark:text-gray-200">
                      {t("customerPortal.noPurchases")}
                    </span>

                    <span className="block mt-1 text-xs text-gray-400">
                      {t("customerPortal.noPurchasesHint")}
                    </span>
                  </>
                }
              />
            </div>
          )}

          {!isLoading && lastPurchases.length > 0 && (
            <ul className="m-0 p-0 list-none">
              {lastPurchases.map((sale: ICustomerPortalSale) => {
                const images: string[] = productsImagesOf(sale);

                return (
                  <li
                    key={sale._id}
                    className="border-b last:border-b-0
                      border-gray-100 dark:border-gray-700"
                  >
                    <Link
                      href={Urls.CUSTOMER_PURCHASE.replace(":saleId", sale._id)}
                      aria-label={`${t("customerPortal.openPurchase")} #${
                        sale.number
                      }`}
                      className="group flex flex-wrap items-center gap-x-4 gap-y-2
                        px-5 py-3 transition-colors
                        hover:bg-gray-50 dark:hover:bg-gray-700/40"
                    >
                      <Avatar.Group
                        max={{ count: MAX_PRODUCT_THUMBS }}
                        shape="square"
                        size={40}
                        className="shrink-0"
                      >
                        {(images.length
                          ? images
                          : [ImagesEnum.FilesNames.DefaultSaleImage]
                        ).map((image: string, index: number) => (
                          <Avatar
                            key={`${image}-${index}`}
                            src={image}
                            shape="square"
                            size={40}
                            className="bg-gray-100 dark:bg-gray-700"
                          />
                        ))}
                      </Avatar.Group>

                      <div className="flex-1 min-w-[10rem]">
                        <div
                          className="text-sm font-medium truncate
                            text-slate-800 dark:text-white"
                        >
                          {storesNamesOf(sale.storesNames)}
                        </div>

                        <div className="mt-0.5 text-xs text-gray-400">
                          #{sale.number} ·{" "}
                          {moment(sale.createdAt).format(
                            DatesEnum.Format.DDMMYYYYhhmmss,
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <SaleStatusTag status={sale.status} />

                        <SalePaymentStatusTag
                          paymentStatus={sale.paymentStatus}
                        />
                      </div>

                      <div
                        className="w-28 text-right text-sm font-semibold
                          tabular-nums text-slate-800 dark:text-white"
                      >
                        {formatterMoney(sale.totals?.totalFinalAmount)}
                      </div>

                      <ArrowRightOutlined
                        className="text-xs text-gray-300
                          group-hover:text-blue-500 transition-colors"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </Layout>
  );
}
