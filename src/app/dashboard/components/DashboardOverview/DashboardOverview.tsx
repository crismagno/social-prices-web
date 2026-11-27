"use client";

import { ReactNode } from "react";

import { Col, Row } from "antd";
import Link from "next/link";

import {
  AppstoreOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import {
  formatFeatureLimitReached,
  isFeatureLimitReached,
  useFeaturesUsage,
} from "../../../../components/common/FeatureUsageBadge/useFeaturesUsage";
import useAuthData from "../../../../data/context/auth/useAuthData";
import useLanguageData from "../../../../data/context/language/useLanguageData";
import { FeatureKey } from "../../../../shared/business/users/user-limits.interface";
import Urls from "../../../../shared/common/routes-app/routes-app";
import { getLocale } from "../../../../shared/utils/locales/locales";
import { getUserName } from "../../../../shared/utils/strings/string";
import { useCountCustomersByUser } from "../../../customers/useCountCustomersByUser";
import {
  useCountChats,
  useCountProductsSold,
  useCountSalesByUser,
} from "./useDashboardCounts";
import { DashboardStatTile } from "./DashboardStatTile";

interface IOverviewTile {
  key: string;
  /** The feature a plan limits; chats and sales have no limit. */
  feature?: FeatureKey;
  label: string;
  count: number;
  isLoading: boolean;
  icon: ReactNode;
  iconClassName: string;
  barClassName: string;
  href: string;
  seeAllLabel: string;
  createHref?: string;
  createTooltip?: string;
  pending?: number;
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

export const DashboardOverview: React.FC = () => {
  const { t, language } = useLanguageData();

  const { user } = useAuthData();

  const { usage } = useFeaturesUsage();

  const { isLoading: isLoadingCustomers, count: customersCount } =
    useCountCustomersByUser();

  const {
    isLoading: isLoadingChats,
    count: chatsCount,
    pending: chatsPending,
  } = useCountChats();

  const {
    isLoading: isLoadingSales,
    count: salesCount,
    pending: salesPending,
  } = useCountSalesByUser();

  const { isLoading: isLoadingSold, count: soldCount } = useCountProductsSold();

  const now: Date = new Date();

  const today: string = now.toLocaleDateString(getLocale(language), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const userName: string = user ? getUserName(user) : "";

  const tiles: IOverviewTile[] = [
    {
      key: "customers",
      feature: "customers",
      label: t("dashboard.customers"),
      count: customersCount,
      isLoading: isLoadingCustomers,
      icon: <TeamOutlined />,
      iconClassName:
        "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
      barClassName: "bg-blue-500",
      href: Urls.CUSTOMERS,
      seeAllLabel: t("dashboard.seeCustomers"),
      createHref: Urls.NEW_CUSTOMER,
      createTooltip: t("dashboard.createNewCustomer"),
    },
    {
      key: "chats",
      label: t("dashboard.chats"),
      count: chatsCount,
      pending: chatsPending,
      isLoading: isLoadingChats,
      icon: <MessageOutlined />,
      iconClassName:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
      barClassName: "bg-emerald-500",
      href: Urls.CHATS,
      seeAllLabel: t("dashboard.seeChats"),
    },
    {
      key: "sales",
      label: t("dashboard.sales"),
      count: salesCount,
      pending: salesPending,
      isLoading: isLoadingSales,
      icon: <ShoppingCartOutlined />,
      iconClassName:
        "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
      barClassName: "bg-amber-500",
      href: Urls.SALES,
      seeAllLabel: t("dashboard.seeSales"),
      createHref: Urls.SALES_CREATE,
      createTooltip: t("sales.createSaleBtnCamelCase"),
    },
    {
      key: "products-sold",
      label: t("dashboard.productsSold"),
      count: soldCount,
      isLoading: isLoadingSold,
      icon: <AppstoreOutlined />,
      iconClassName:
        "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
      barClassName: "bg-violet-500",
      href: Urls.SALES,
      seeAllLabel: t("dashboard.seeSales"),
    },
  ];

  return (
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
          href={Urls.SALES_CREATE}
          className="flex items-center gap-2 h-10 px-4 rounded-lg shrink-0
            text-sm font-medium bg-white text-blue-700
            hover:bg-blue-50 hover:text-blue-800 transition-colors"
        >
          <ShoppingCartOutlined className="text-base" />
          {t("sales.createSaleBtnCamelCase")}
        </Link>
      </div>

      <Row gutter={[12, 12]} className="mt-3">
        {tiles.map((tile: IOverviewTile) => {
          const isLimitReached: boolean =
            !!tile.feature && isFeatureLimitReached(usage, tile.feature);

          return (
            <Col key={tile.key} xs={24} sm={12} lg={6}>
              <DashboardStatTile
                label={tile.label}
                count={tile.count}
                isLoading={tile.isLoading}
                icon={tile.icon}
                iconClassName={tile.iconClassName}
                barClassName={isLimitReached ? "bg-red-500" : tile.barClassName}
                href={tile.href}
                seeAllLabel={tile.seeAllLabel}
                usage={tile.feature ? usage?.[tile.feature] : undefined}
                usageLabel={t("dashboard.planUsage")}
                pending={
                  tile.pending === undefined
                    ? undefined
                    : { count: tile.pending, label: t("dashboard.pending") }
                }
                create={
                  tile.createHref && tile.createTooltip
                    ? {
                        href: tile.createHref,
                        tooltip: tile.createTooltip,
                        disabledTooltip:
                          isLimitReached && tile.feature
                            ? formatFeatureLimitReached(t, tile.feature, usage)
                            : undefined,
                      }
                    : undefined
                }
              />
            </Col>
          );
        })}
      </Row>
    </section>
  );
};
