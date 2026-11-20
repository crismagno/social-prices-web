"use client";

import { ReactNode } from "react";

import { Col, Row } from "antd";
import Link from "next/link";

import {
  AppstoreOutlined,
  BlockOutlined,
  ShopOutlined,
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
import { useCountCategoriesByUser } from "../../../categories/useCountCategoriesByUser";
import { useCountCustomersByUser } from "../../../customers/useCountCustomersByUser";
import { useCountProductsByUser } from "../../../products/useCountProductsByUser";
import { useFindStoresByUser } from "../../../stores/useFindStoresByUser";
import { DashboardStatTile } from "./DashboardStatTile";

interface IOverviewTile {
  feature: FeatureKey;
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

  const { isLoading: isLoadingStores, stores } = useFindStoresByUser();

  const { isLoading: isLoadingCustomers, count: customersCount } =
    useCountCustomersByUser();

  const { isLoading: isLoadingProducts, count: productsCount } =
    useCountProductsByUser();

  const { isLoading: isLoadingCategories, count: categoriesCount } =
    useCountCategoriesByUser();

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
      feature: "stores",
      label: t("dashboard.stores"),
      count: stores.length,
      isLoading: isLoadingStores,
      icon: <ShopOutlined />,
      iconClassName:
        "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
      barClassName: "bg-amber-500",
      href: Urls.STORES,
      seeAllLabel: t("dashboard.seeStores"),
      createHref: Urls.NEW_STORE,
      createTooltip: t("dashboard.createNewStore"),
    },
    {
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
      feature: "products",
      label: t("dashboard.products"),
      count: productsCount,
      isLoading: isLoadingProducts,
      icon: <AppstoreOutlined />,
      iconClassName:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
      barClassName: "bg-emerald-500",
      href: Urls.PRODUCTS,
      seeAllLabel: t("dashboard.seeProducts"),
      createHref: Urls.NEW_PRODUCT,
      createTooltip: t("dashboard.createNewProduct"),
    },
    {
      feature: "categories",
      label: t("dashboard.categories"),
      count: categoriesCount,
      isLoading: isLoadingCategories,
      icon: <BlockOutlined />,
      iconClassName:
        "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
      barClassName: "bg-violet-500",
      href: Urls.CATEGORIES,
      seeAllLabel: t("dashboard.seeCategories"),
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
          const isLimitReached: boolean = isFeatureLimitReached(
            usage,
            tile.feature
          );

          return (
            <Col key={tile.feature} xs={24} sm={12} lg={6}>
              <DashboardStatTile
                label={tile.label}
                count={tile.count}
                isLoading={tile.isLoading}
                icon={tile.icon}
                iconClassName={tile.iconClassName}
                barClassName={isLimitReached ? "bg-red-500" : tile.barClassName}
                href={tile.href}
                seeAllLabel={tile.seeAllLabel}
                usage={usage?.[tile.feature]}
                usageLabel={t("dashboard.planUsage")}
                create={
                  tile.createHref && tile.createTooltip
                    ? {
                        href: tile.createHref,
                        tooltip: tile.createTooltip,
                        disabledTooltip: isLimitReached
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
