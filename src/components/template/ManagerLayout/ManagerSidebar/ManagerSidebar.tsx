"use client";

import { useState } from "react";

import { Modal, Tag } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";

import useLanguageData from "../../../../data/context/language/useLanguageData";
import useManagerAuthData from "../../../../data/context/managerAuth/useManagerAuthData";
import ManagersEnum from "../../../../shared/business/managers/managers.enum";
import Urls from "../../../../shared/common/routes-app/routes-app";
import { Logo1 } from "../../../common/Logo/Logo1";

const ManagerSidebar: React.FC = () => {
  const { t } = useLanguageData();

  const { manager, logout } = useManagerAuthData();

  const pathname: string = usePathname();

  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  if (!manager) {
    return null;
  }

  const items = [
    {
      url: Urls.MANAGER_MANAGERS,
      label: t("manager.managers"),
      icon: <TeamOutlined />,
    },
    {
      url: Urls.MANAGER_USERS,
      label: t("manager.users"),
      icon: <UserOutlined />,
    },
  ];

  return (
    <>
      <aside
        className="w-64 shrink-0 min-h-screen bg-white shadow-lg
          flex flex-col justify-between sticky top-0"
      >
        <div>
          <div className="flex flex-col items-center py-6 border-b border-gray-100">
            <Logo1 size={60} className="m-0" />

            <span className="text-sm font-semibold text-gray-600 mt-2">
              {t("manager.panel")}
            </span>
          </div>

          <nav className="flex flex-col mt-4">
            {items.map((item) => {
              const isActive: boolean = pathname?.startsWith(item.url);

              return (
                <Link
                  key={item.url}
                  href={item.url}
                  className={`flex flex-row items-center gap-3 px-6 py-3 text-sm
                    transition-colors
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-600 border-r-4 border-blue-500 font-semibold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-gray-100 p-4">
          <div className="flex flex-col mb-3">
            <span className="text-sm font-semibold text-gray-700 truncate">
              {manager.name}
            </span>

            <span className="text-xs text-gray-400 truncate">
              {manager.email}
            </span>

            <div className="mt-2">
              <Tag color={ManagersEnum.LevelColors[manager.level]}>
                {t(ManagersEnum.LevelLabels[manager.level])}
              </Tag>

              {manager.isMain && <Tag color="gold">{t("manager.isMain")}</Tag>}
            </div>
          </div>

          <button
            className="flex flex-row items-center gap-2 text-sm text-red-600
              hover:text-red-700 cursor-pointer"
            onClick={() => setShowLogoutModal(true)}
            type="button"
          >
            <LogoutOutlined />
            {t("manager.logout")}
          </button>
        </div>
      </aside>

      <Modal
        open={showLogoutModal}
        title={t("manager.logout")}
        destroyOnHidden
        onCancel={() => setShowLogoutModal(false)}
        onOk={async () => {
          await logout();
          setShowLogoutModal(false);
        }}
        okText={t("manager.yes")}
        cancelText={t("manager.no")}
      >
        {t("manager.logoutConfirm")}
      </Modal>
    </>
  );
};

export default ManagerSidebar;
