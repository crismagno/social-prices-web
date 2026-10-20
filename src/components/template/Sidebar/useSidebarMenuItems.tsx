import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Badge } from "antd";
import { usePathname } from "next/navigation";

import {
  ApiOutlined,
  AppstoreOutlined,
  BellOutlined,
  BlockOutlined,
  CalendarOutlined,
  CustomerServiceOutlined,
  DollarOutlined,
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
import AppsEnum from "../../../shared/business/apps/apps.enum";
import { IAppCatalogItem } from "../../../shared/business/apps/apps.types";
import { APP_URLS } from "../../../shared/common/routes-app/apps-urls";
import AppIcon from "../../common/AppIcon/AppIcon";
import { getItem, MenuItem } from "../../utils/navigation/navigation.util";

export namespace SidebarMenuKeys {
  export const STORES = "stores";
  export const SALES = "sales";
  export const GENERAL = "general";
  export const APPS = "apps";
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
    [SidebarMenuKeys.APPS]: [
      Urls.APPS,
      Urls.APPS_GOOGLE_CONTACTS,
      Urls.APPS_TELEGRAM,
      Urls.APPS_MESSENGER,
      Urls.APPS_INSTAGRAM,
    ],
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
    apps: { catalog },
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

  // Finances are hidden for the lowest employee level (the API refuses it too).
  const transactionsItems: MenuItem[] =
    employee?.level !== EmployeesEnum.Level.EMPLOYEE
      ? [
          getItem(
            t("navigation.transactions"),
            Urls.TRANSACTIONS,
            <DollarOutlined />,
          ),
        ]
      : [];

  // An app that is connected, has a page of its own, and has the manager's okay.
  const connectedApps: IAppCatalogItem[] = catalog.filter(
    (app: IAppCatalogItem) =>
      app.enabled && app.integrated && app.connected && !!APP_URLS[app.id],
  );

  const unreadInApps: number = connectedApps.reduce(
    (sum: number, app: IAppCatalogItem) => sum + app.unreadCount,
    0,
  );

  // A label with the count of unread messages at its right end.
  // `hasArrow`: a submenu has its arrow at the right end, so the count keeps clear of it.
  const labelWithCount = (
    label: string,
    count: number,
    hasArrow: boolean = false,
  ): React.ReactNode =>
    count > 0 ? (
      <span className="flex items-center justify-between w-full">
        <span>{label}</span>

        <Badge
          count={count}
          size="small"
          overflowCount={99}
          style={hasArrow ? { marginRight: 22 } : undefined}
        />
      </span>
    ) : (
      label
    );

  // Collapsed there is no label, so a dot is kept on the icon.
  const appsIcon: React.ReactNode =
    unreadInApps > 0 && isCollapsed ? (
      <Badge dot offset={[-3, 3]}>
        <ApiOutlined />
      </Badge>
    ) : (
      <ApiOutlined />
    );

  // Apps is always in the menu: the page lists every app, and only the ones the
  // manager enabled can be used. Once an app is connected it becomes a submenu:
  // the list of apps, then one entry per connected app, each with its unread
  // messages.
  const appsItems: MenuItem[] =
    connectedApps.length === 0
      ? [getItem(t("navigation.apps"), Urls.APPS, <ApiOutlined />)]
      : [
          getItem(
            labelWithCount(t("navigation.apps"), unreadInApps, true),
            SidebarMenuKeys.APPS,
            appsIcon,
            [
              getItem(t("navigation.allApps"), Urls.APPS, <AppstoreOutlined />),
              // Collapsed, an item with a badge inside loses its name in the flyout
              // (antd does not paint it), so there the count is part of the text.
              ...connectedApps.map((app: IAppCatalogItem) =>
                getItem(
                  isCollapsed
                    ? app.unreadCount > 0
                      ? `${t(`apps.names.${app.id}`)} (${app.unreadCount})`
                      : t(`apps.names.${app.id}`)
                    : labelWithCount(
                        t(`apps.names.${app.id}`),
                        app.unreadCount,
                      ),
                  APP_URLS[app.id],
                  <AppIcon app={app.id as AppsEnum.App} />,
                ),
              ),
            ],
          ),
        ];

  const items: MenuItem[] = [
    getItem(t("navigation.home"), Urls.DASHBOARD, <HomeOutlined />),
    getItem(notificationsLabel, Urls.NOTIFICATIONS, notificationsIcon),
    getItem(t("navigation.settings"), Urls.SETTINGS, <SettingOutlined />),
    getItem(t("navigation.notes"), Urls.NOTES, <CalendarOutlined />),
    ...appsItems,
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
    ...transactionsItems,
    getItem(
      t("navigation.general"),
      SidebarMenuKeys.GENERAL,
      <BlockOutlined />,
      generalChildren,
    ),
    getItem(t("navigation.support"), Urls.SUPPORT, <CustomerServiceOutlined />),
  ];

  // The longest matching route wins, so /sales/create selects "create sale"
  // rather than "sales".
  const routeUrls: string[] = [
    Urls.DASHBOARD,
    Urls.NOTIFICATIONS,
    Urls.SETTINGS,
    Urls.SUPPORT,
    Urls.TRANSACTIONS,
    Urls.NOTES,
    Urls.APPS,
    Urls.APPS_GOOGLE_CONTACTS,
    Urls.APPS_TELEGRAM,
    Urls.APPS_MESSENGER,
    Urls.APPS_INSTAGRAM,
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
