import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Badge } from "antd";
import { usePathname } from "next/navigation";

import {
  AppstoreOutlined,
  BellOutlined,
  BlockOutlined,
  HomeOutlined,
  InboxOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import useAppData from "../../../data/context/app/useAppData";
import useAuthData from "../../../data/context/auth/useAuthData";
import useLanguageData from "../../../data/context/language/useLanguageData";
import EmployeesEnum from "../../../shared/business/employees/employees.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import { getItem, MenuItem } from "../../utils/navigation/navigation.util";

export namespace SidebarMenuKeys {
  export const STORES = "stores";
  export const SALES = "sales";
  export const GENERAL = "general";
}

export interface IUseSidebarMenuItems {
  items: MenuItem[];
  selectedKeys: string[];
  openKeys: string[];
  setOpenKeys: Dispatch<SetStateAction<string[]>>;
}

// Keys of the submenus that hold each route, so the submenu holding the
// current page can start open.
const submenuKeyByUrl = (url: string): string | null => {
  const submenus: Record<string, string[]> = {
    [SidebarMenuKeys.STORES]: [
      Urls.STORES,
      Urls.CUSTOMERS,
      Urls.PRODUCTS,
      Urls.PRODUCT_ITEMS,
    ],
    [SidebarMenuKeys.SALES]: [Urls.SALES, Urls.SALES_CREATE],
    [SidebarMenuKeys.GENERAL]: [Urls.TAGS, Urls.CATEGORIES, Urls.EMPLOYEES],
  };

  const entry = Object.entries(submenus).find(([, urls]) => urls.includes(url));

  return entry ? entry[0] : null;
};

export const useSidebarMenuItems = (
  isCollapsed: boolean,
): IUseSidebarMenuItems => {
  const { t } = useLanguageData();

  const { employee } = useAuthData();

  const {
    notifications: {
      countNotificationNotSeen,
      isLoadingCountNotificationNotSeen,
    },
  } = useAppData();

  const pathname: string = usePathname() ?? "";

  const hasUnseenNotifications: boolean =
    !isLoadingCountNotificationNotSeen && !!countNotificationNotSeen;

  // Expanded: the badge sits at the right end of the item. Collapsed: there is
  // no label, so a dot is kept on the icon, pulled inside so it is not clipped.
  const notificationsIcon = hasUnseenNotifications ? (
    isCollapsed ? (
      <Badge dot offset={[-3, 3]}>
        <BellOutlined className="animate-pulse text-yellow-500" />
      </Badge>
    ) : (
      <BellOutlined className="animate-pulse text-yellow-500" />
    )
  ) : (
    <BellOutlined />
  );

  const notificationsLabel: React.ReactNode =
    hasUnseenNotifications && !isCollapsed ? (
      <span className="flex items-center justify-between w-full">
        <span>{t("navigation.notifications")}</span>

        <Badge
          count={countNotificationNotSeen}
          size="small"
          overflowCount={99}
        />
      </span>
    ) : (
      t("navigation.notifications")
    );

  const generalChildren: MenuItem[] = [
    getItem(t("navigation.tags"), Urls.TAGS, <TagOutlined />),
    getItem(t("navigation.categories"), Urls.CATEGORIES, <BlockOutlined />),
  ];

  if (employee?.level !== EmployeesEnum.Level.EMPLOYEE) {
    generalChildren.push(
      getItem(t("navigation.employees"), Urls.EMPLOYEES, <TeamOutlined />),
    );
  }

  const items: MenuItem[] = [
    getItem(t("navigation.home"), Urls.DASHBOARD, <HomeOutlined />),
    getItem(notificationsLabel, Urls.NOTIFICATIONS, notificationsIcon),
    getItem(t("navigation.settings"), Urls.SETTINGS, <SettingOutlined />),
    getItem(t("navigation.stores"), SidebarMenuKeys.STORES, <ShopOutlined />, [
      getItem(t("navigation.stores"), Urls.STORES, <ShopOutlined />),
      getItem(t("navigation.customers"), Urls.CUSTOMERS, <TeamOutlined />),
      getItem(t("navigation.products"), Urls.PRODUCTS, <AppstoreOutlined />),
      getItem(
        t("navigation.productItems"),
        Urls.PRODUCT_ITEMS,
        <InboxOutlined />,
      ),
    ]),
    getItem(
      t("navigation.sales"),
      SidebarMenuKeys.SALES,
      <ShoppingCartOutlined />,
      [
        getItem(t("navigation.sales"), Urls.SALES, <ShoppingCartOutlined />),
        getItem(
          t("sales.createSale"),
          Urls.SALES_CREATE,
          <ShoppingCartOutlined />,
        ),
      ],
    ),
    getItem(
      t("navigation.general"),
      SidebarMenuKeys.GENERAL,
      <BlockOutlined />,
      generalChildren,
    ),
  ];

  // The longest matching route wins, so /sales/create selects "create sale"
  // rather than "sales".
  const routeUrls: string[] = [
    Urls.DASHBOARD,
    Urls.NOTIFICATIONS,
    Urls.SETTINGS,
    Urls.STORES,
    Urls.CUSTOMERS,
    Urls.PRODUCTS,
    Urls.PRODUCT_ITEMS,
    Urls.SALES,
    Urls.SALES_CREATE,
    Urls.TAGS,
    Urls.CATEGORIES,
    Urls.EMPLOYEES,
  ];

  const selectedUrl: string | undefined = routeUrls
    .filter((url: string) => pathname === url || pathname.startsWith(`${url}/`))
    .sort((a: string, b: string) => b.length - a.length)[0];

  const selectedKeys: string[] = selectedUrl ? [selectedUrl] : [];

  const openSubmenuKey: string | null = selectedUrl
    ? submenuKeyByUrl(selectedUrl)
    : null;

  const [openKeys, setOpenKeys] = useState<string[]>(
    openSubmenuKey && !isCollapsed ? [openSubmenuKey] : [],
  );

  // While the sidebar is expanded, the submenu holding the current page is
  // opened on every navigation, without closing the ones the user opened by
  // hand. While collapsed nothing is forced open, so no flyout covers the page;
  // the current page shows only through antd's selected state (blue).
  useEffect(() => {
    if (isCollapsed) {
      setOpenKeys([]);
      return;
    }

    if (!openSubmenuKey) {
      return;
    }

    setOpenKeys((currentOpenKeys: string[]) =>
      currentOpenKeys.includes(openSubmenuKey)
        ? currentOpenKeys
        : [...currentOpenKeys, openSubmenuKey],
    );
  }, [pathname, openSubmenuKey, isCollapsed]);

  return {
    items,
    selectedKeys,
    openKeys,
    setOpenKeys,
  };
};
