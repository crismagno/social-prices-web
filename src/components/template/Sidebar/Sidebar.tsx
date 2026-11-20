"use client";

import { useState } from "react";

import {
  ConfigProvider,
  Menu,
  Modal,
  Tag,
  ThemeConfig,
  Tooltip,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingCartOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

import useAppData from "../../../data/context/app/useAppData";
import useAuthData from "../../../data/context/auth/useAuthData";
import useLanguageData from "../../../data/context/language/useLanguageData";
import EmployeesEnum from "../../../shared/business/employees/employees.enum";
import UsersEnum from "../../../shared/business/users/users.enum";
import ThemeEnum from "../../../shared/common/enums/theme.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import { getUserName } from "../../../shared/utils/strings/string";
import Avatar from "../../common/Avatar/Avatar";
import { FastSaleDrawer } from "../../common/FastSaleDrawer/FastSaleDrawer";
import { IconLogout } from "../../common/icons/icons";
import { Logo1 } from "../../common/Logo/Logo1";
import { AccountModeSwitch } from "../AccountModeSwitch/AccountModeSwitch";
import { useSidebarCollapsed } from "./useSidebarCollapsed";
import { useSidebarMenuItems } from "./useSidebarMenuItems";

interface Props {}

// Rounded "pill" rows with a soft highlight on the current page. The rows are
// kept short so the closed menu fits the screen without a scrollbar.
const MENU_THEME: ThemeConfig = {
  components: {
    Menu: {
      itemHeight: 36,
      itemMarginBlock: 2,
      itemMarginInline: 10,
      itemBorderRadius: 10,
      iconSize: 16,
      collapsedIconSize: 17,
      activeBarBorderWidth: 0,
      itemBg: "transparent",
      subMenuItemBg: "transparent",
      itemColor: "#475569",
      itemHoverColor: "#0f172a",
      itemHoverBg: "#f1f5f9",
      itemActiveBg: "#e2e8f0",
      itemSelectedBg: "#eff6ff",
      itemSelectedColor: "#2563eb",
      darkItemBg: "transparent",
      darkSubMenuItemBg: "transparent",
      darkItemColor: "#cbd5e1",
      darkItemHoverColor: "#ffffff",
      darkItemHoverBg: "rgba(255, 255, 255, 0.07)",
      darkItemSelectedBg: "rgba(59, 130, 246, 0.24)",
      darkItemSelectedColor: "#ffffff",
    },
  },
};

const MENU_CLASS_NAME: string = `border-e-0 bg-transparent py-2
  [&_.ant-menu-item-selected]:font-semibold
  [&_.ant-menu-submenu-selected>.ant-menu-submenu-title]:font-semibold`;

const ACTION_BUTTON_CLASS_NAME: string = `flex items-center justify-center
  gap-1.5 min-w-0 cursor-pointer text-white shadow-md
  transition-all duration-200 hover:scale-105`;

const ICON_BUTTON_CLASS_NAME: string = `flex items-center justify-center
  shrink-0 w-8 h-8 rounded-lg transition-colors`;

const Sidebar: React.FC<Props> = ({}) => {
  const { t } = useLanguageData();

  const { user, employee, isCustomer } = useAuthData();

  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  const [showFastSale, setShowFastSale] = useState<boolean>(false);

  const {
    theme: { theme },
  } = useAppData();

  const router = useRouter();

  const { isCollapsed, isTransitionEnabled, toggleIsCollapsed } =
    useSidebarCollapsed();

  const { items, selectedKeys, openKeys, setOpenKeys } =
    useSidebarMenuItems(isCollapsed);

  if (!user) {
    return null;
  }

  const userName: string = getUserName(user);

  const isDark: boolean = theme === ThemeEnum.Theme.DARK;

  // An employee session shows its level next to the account name; seen as a
  // customer, it shows the customer tag instead.
  const employeeTagLabel: string = !employee
    ? ""
    : isCustomer
    ? t(UsersEnum.TypeLabels[UsersEnum.Type.CUSTOMER])
    : t(EmployeesEnum.LevelLabels[employee.level]);

  const employeeTagColor: string | undefined =
    employee && !isCustomer
      ? EmployeesEnum.LevelColors[employee.level]
      : undefined;

  const avatarTitle: string = employee
    ? `${userName} · ${employeeTagLabel}`
    : userName;

  const toggleLabel: string = isCollapsed
    ? t("navigation.expandMenu")
    : t("navigation.collapseMenu");

  return (
    <>
      <aside
        className={`${isCollapsed ? "w-20" : "w-64"} shrink-0 sticky top-0
          h-screen overflow-hidden z-40
          flex flex-col
          ${isTransitionEnabled ? "transition-all duration-200" : ""}
          border-r border-gray-200 dark:border-gray-700
          bg-white dark:bg-gray-900 dark:text-white`}
      >
        <div className="shrink-0 flex items-center justify-center px-2 pt-3 pb-1">
          <Link
            href={Urls.DASHBOARD}
            className="flex items-center justify-center shrink-0"
          >
            <Logo1 size={isCollapsed ? 52 : 64} className="m-0" />
          </Link>
        </div>

        <div
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden
            [scrollbar-width:thin]"
        >
          {/* Shorter rows, so the closed menu fits the screen without a
              scrollbar. */}
          <ConfigProvider theme={MENU_THEME}>
            <Menu
              mode="inline"
              theme={isDark ? "dark" : "light"}
              inlineCollapsed={isCollapsed}
              items={items}
              selectedKeys={selectedKeys}
              openKeys={openKeys}
              onOpenChange={(nextOpenKeys) =>
                setOpenKeys(nextOpenKeys as string[])
              }
              onClick={(event) => router.push(event.key)}
              className={MENU_CLASS_NAME}
            />
          </ConfigProvider>
        </div>

        <div
          className="shrink-0 flex flex-col items-center gap-2 px-3 py-2
            border-t border-gray-100 dark:border-gray-700"
        >
          {!isCustomer && (
            <div
              className={
                isCollapsed
                  ? "flex flex-col items-center gap-2"
                  : "grid grid-cols-2 gap-2 w-full"
              }
            >
              <Tooltip title={t("sales.fastSale")}>
                <button
                  type="button"
                  onClick={() => setShowFastSale(true)}
                  aria-label={t("sales.fastSale")}
                  className={`${ACTION_BUTTON_CLASS_NAME}
                    bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500
                    shadow-amber-500/40
                    ${
                      isCollapsed
                        ? "w-9 h-9 rounded-full"
                        : "h-9 rounded-lg px-2"
                    }`}
                >
                  <ThunderboltOutlined className="text-base" />

                  {!isCollapsed && (
                    <span className="text-xs truncate">
                      {t("sales.fastSale")}
                    </span>
                  )}
                </button>
              </Tooltip>

              <Tooltip title={t("sales.createSaleBtnCamelCase")}>
                <Link
                  href={Urls.SALES_CREATE}
                  aria-label={t("sales.createSaleBtnCamelCase")}
                  className={`${ACTION_BUTTON_CLASS_NAME}
                    bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600
                    hover:from-blue-300 hover:via-blue-400 hover:to-blue-500
                    hover:text-white shadow-blue-500/40
                    ${
                      isCollapsed
                        ? "w-9 h-9 rounded-full"
                        : "h-9 rounded-lg px-2"
                    }`}
                >
                  <ShoppingCartOutlined className="text-base" />

                  {!isCollapsed && (
                    <span className="text-xs truncate">
                      {t("sales.createSaleBtnCamelCase")}
                    </span>
                  )}
                </Link>
              </Tooltip>
            </div>
          )}

          <AccountModeSwitch isCollapsed={isCollapsed} />
        </div>

        <div
          className={`shrink-0 flex items-center gap-1
            border-t border-gray-100 dark:border-gray-700
            ${isCollapsed ? "flex-col py-2" : "px-3 py-2"}`}
        >
          <Link
            href={Urls.PROFILE}
            className={`flex items-center min-w-0 rounded-lg p-1
              transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                isCollapsed ? "justify-center" : "flex-1 gap-2"
              }`}
          >
            <Avatar
              src={user.avatar}
              alt={userName}
              title={isCollapsed ? avatarTitle : undefined}
              width={32}
            />

            {!isCollapsed && (
              <div className="flex flex-col min-w-0 leading-tight">
                <span
                  className="text-sm font-semibold truncate
                    text-slate-800 dark:text-white"
                >
                  {userName}
                </span>

                {employee ? (
                  <Tooltip title={employee.name}>
                    <Tag
                      className="m-0 mt-0.5 w-fit max-w-full truncate"
                      color={employeeTagColor}
                    >
                      {employeeTagLabel}
                    </Tag>
                  </Tooltip>
                ) : (
                  <span className="text-xs text-gray-400 truncate">
                    {t("navigation.profile")}
                  </span>
                )}
              </div>
            )}
          </Link>

          <Tooltip
            placement={isCollapsed ? "right" : "top"}
            title={t("navigation.logout")}
          >
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              aria-label={t("navigation.logout")}
              className={`${ICON_BUTTON_CLASS_NAME}
                text-red-600 hover:bg-red-400 hover:text-white
                dark:text-red-300 dark:hover:bg-slate-700`}
            >
              {IconLogout}
            </button>
          </Tooltip>

          <Tooltip placement={isCollapsed ? "right" : "top"} title={toggleLabel}>
            <button
              type="button"
              onClick={toggleIsCollapsed}
              aria-label={toggleLabel}
              aria-expanded={!isCollapsed}
              className={`${ICON_BUTTON_CLASS_NAME}
                text-slate-500 hover:bg-gray-100 hover:text-blue-500
                dark:text-gray-300 dark:hover:bg-gray-700
                dark:hover:text-white`}
            >
              {isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
          </Tooltip>
        </div>
      </aside>

      {/* Mounted only for the company side: it loads the stores, which a
          customer account cannot read. */}
      {!isCustomer && (
        <FastSaleDrawer
          open={showFastSale}
          onClose={() => setShowFastSale(false)}
        />
      )}

      <Modal
        open={showLogoutModal}
        title={t("navigation.logout")}
        destroyOnHidden
        onCancel={() => setShowLogoutModal(false)}
        onOk={() => router.push(Urls.LOGOUT)}
        okText={t("common.yes")}
        cancelText={t("common.no")}
      >
        <div className="flex justify-center absolute right-0 w-full -top-16">
          <Avatar
            src={user?.avatar}
            width={120}
            className="shadow-lg border-none z-10"
          />
        </div>
        {t("auth.logoutConfirm")}
      </Modal>
    </>
  );
};

export default Sidebar;
