"use client";

import { useState } from "react";

import { Menu, Modal, Tooltip } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

import useAppData from "../../../data/context/app/useAppData";
import useAuthData from "../../../data/context/auth/useAuthData";
import useLanguageData from "../../../data/context/language/useLanguageData";
import ThemeEnum from "../../../shared/common/enums/theme.enum";
import Urls from "../../../shared/common/routes-app/routes-app";
import { getUserName } from "../../../shared/utils/strings/string";
import Avatar from "../../common/Avatar/Avatar";
import { IconLogout } from "../../common/icons/icons";
import { Logo1 } from "../../common/Logo/Logo1";
import { EmployeeProfileButton } from "../EmployeeProfileButton/EmployeeProfileButton";
import { useSidebarCollapsed } from "./useSidebarCollapsed";
import { useSidebarMenuItems } from "./useSidebarMenuItems";

interface Props {}

const Sidebar: React.FC<Props> = ({}) => {
  const { t } = useLanguageData();

  const { user, logout } = useAuthData();

  const {
    theme: { theme },
  } = useAppData();

  const router = useRouter();

  const { isCollapsed, isTransitionEnabled, toggleIsCollapsed } =
    useSidebarCollapsed();

  const { items, selectedKeys, openKeys, setOpenKeys } =
    useSidebarMenuItems(isCollapsed);

  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  if (!user) {
    return null;
  }

  const userName: string = getUserName(user);

  const isDark: boolean = theme === ThemeEnum.Theme.DARK;

  return (
    <>
      <aside
        className={`${isCollapsed ? "w-20" : "w-64"} shrink-0 sticky top-0
          h-screen overflow-y-auto overflow-x-hidden z-40
          flex flex-col justify-between
          ${isTransitionEnabled ? "transition-all duration-200" : ""}
          shadow-lg shadow-slate-300 dark:shadow-slate-900
          bg-white dark:bg-gray-800 dark:text-white`}
      >
        <div>
          <div
            className={`relative flex items-center justify-center px-2 py-3 ${
              isCollapsed ? "flex-col gap-2" : "flex-row"
            }`}
          >
            <Link
              href={Urls.DASHBOARD}
              className="flex items-center justify-center shrink-0"
            >
              <Logo1 size={isCollapsed ? 52 : 56} className="m-0" />
            </Link>

            <Tooltip
              title={
                isCollapsed
                  ? t("navigation.expandMenu")
                  : t("navigation.collapseMenu")
              }
            >
              <button
                type="button"
                onClick={toggleIsCollapsed}
                aria-label={
                  isCollapsed
                    ? t("navigation.expandMenu")
                    : t("navigation.collapseMenu")
                }
                className={`flex items-center justify-center w-8 h-8 rounded-full
                  text-slate-600 hover:bg-gray-100 hover:text-blue-500
                  dark:text-white dark:hover:bg-gray-700 transition-all
                  ${isCollapsed ? "" : "absolute right-2"}`}
              >
                {isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </button>
            </Tooltip>
          </div>

          <div
            className="flex flex-col items-center gap-2 px-2 py-3
              border-y border-gray-100 dark:border-gray-700"
          >
            <Link
              href={Urls.PROFILE}
              className={`flex items-center w-full ${
                isCollapsed ? "justify-center" : "gap-3 px-2"
              }`}
            >
              <Avatar
                src={user.avatar}
                alt={userName}
                title={isCollapsed ? userName : undefined}
                width={isCollapsed ? 36 : 44}
              />

              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span
                    className="text-sm font-semibold truncate
                      text-slate-800 dark:text-white"
                  >
                    {userName}
                  </span>

                  <span className="text-xs text-gray-400 truncate">
                    {t("navigation.profile")}
                  </span>
                </div>
              )}
            </Link>
          </div>

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
            className="border-e-0 bg-transparent mt-2"
          />
        </div>

        <div
          className="flex flex-col items-center gap-3 p-3
            border-t border-gray-100 dark:border-gray-700"
        >
          <Tooltip title={t("sales.createSaleBtnCamelCase")}>
            <Link
              href={Urls.SALES_CREATE}
              className={`flex items-center justify-center gap-2 cursor-pointer
                text-white transition-all duration-200 hover:scale-105
                bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600
                hover:from-blue-300 hover:via-blue-400 hover:to-blue-500
                shadow-lg shadow-blue-500/40 hover:shadow-blue-400/60
                ${
                  isCollapsed
                    ? "w-11 h-11 rounded-full"
                    : "w-full h-11 rounded-lg px-3"
                }`}
            >
              <ShoppingCartOutlined className="text-lg" />

              {!isCollapsed && (
                <span className="text-sm truncate">
                  {t("sales.createSaleBtnCamelCase")}
                </span>
              )}
            </Link>
          </Tooltip>

          <EmployeeProfileButton isCollapsed={isCollapsed} />

          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className={`flex items-center justify-center gap-2 h-10 rounded-lg
              text-red-600 hover:bg-red-400 hover:text-white transition-all
              dark:text-white dark:hover:bg-slate-700
              ${isCollapsed ? "w-10" : "w-full"}`}
          >
            <Tooltip title={isCollapsed ? t("navigation.logout") : undefined}>
              {IconLogout}
            </Tooltip>

            {!isCollapsed && (
              <span className="text-sm">{t("navigation.logout")}</span>
            )}
          </button>
        </div>
      </aside>

      <Modal
        open={showLogoutModal}
        title={t("navigation.logout")}
        destroyOnHidden
        onCancel={() => setShowLogoutModal(false)}
        onOk={async () => {
          await logout();
          setShowLogoutModal(false);
        }}
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
