import { useState } from "react";

import { Modal } from "antd";

import useAppData from "../../../data/context/app/useAppData";
import useAuthData from "../../../data/context/auth/useAuthData";
import Urls from "../../../shared/common/routes-app/routes-app";
import { getUserName } from "../../../shared/utils/strings/string";
import Avatar from "../../common/Avatar/Avatar";
import {
  IconAdjustmentsHorizontal,
  IconBell,
  IconBellAlert,
  IconHome,
  IconLogout,
} from "../../common/icons/icons";
import { Logo1 } from "../../common/Logo/Logo1";
import { EmployeeProfileButton } from "../EmployeeProfileButton/EmployeeProfileButton";
import { GeneralMenu } from "./GeneralMenu/GeneralMenu";
import NavigationItem from "./NavigationItem";
import { SalesMenu } from "./SalesMenu/SalesMenu";
import { StoresMenu } from "./StoresMenu/StoresMenu";

interface Props {}

const Navigation: React.FC<Props> = ({}) => {
  const { user, logout } = useAuthData();

  const {
    notifications: {
      countNotificationNotSeen,
      isLoadingCountNotificationNotSeen,
    },
  } = useAppData();

  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  if (!user) {
    return null;
  }

  return (
    <>
      <div
        className="social-navigation max-h-20 flex flex-row
      shadow-lg shadow-slate-600 dark:shadow-white 
     bg-white dark:bg-gray-800 dark:text-white w-screen overflow-x-auto
      fixed bottom-0 left-0 z-50"
      >
        <ul className="flex lg:w-5/12 mb-0">
          <NavigationItem
            text="Profile"
            url={Urls.PROFILE}
            title={getUserName(user)}
          >
            <Avatar src={user?.avatar} alt="Image logo" />
          </NavigationItem>

          <NavigationItem icon={IconHome()} text="Home" url={Urls.DASHBOARD} />

          <NavigationItem
            icon={
              countNotificationNotSeen
                ? IconBellAlert("animate-pulse text-yellow-500")
                : IconBell()
            }
            text="Notifications"
            url={Urls.NOTIFICATIONS}
            isLoading={isLoadingCountNotificationNotSeen}
          />

          <NavigationItem
            icon={IconAdjustmentsHorizontal}
            text="Settings"
            url={Urls.SETTINGS}
          />

          <StoresMenu />

          <SalesMenu />

          <GeneralMenu />
        </ul>

        <div className="flex flex-grow justify-center items-center mb-0">
          <Logo1 size={50} className="m-0" />
        </div>

        <ul className="flex justify-end items-center lg:w-5/12 mb-0">
          <EmployeeProfileButton />

          <NavigationItem
            icon={IconLogout}
            text={"Logout"}
            onClick={() => setShowLogoutModal(true)}
            className="
            text-red-600 hover:bg-red-400 hover:text-white ml-2
            dark:text-white dark:hover:bg-slate-700"
          />
        </ul>
      </div>

      <Modal
        open={showLogoutModal}
        title="Logout"
        destroyOnHidden
        onCancel={() => setShowLogoutModal(false)}
        onOk={async () => {
          await logout();
          setShowLogoutModal(false);
        }}
        okText={"Yes"}
        cancelText={"No"}
      >
        <div className="flex justify-center absolute right-0 w-full -top-16">
          <Avatar
            src={user?.avatar}
            width={120}
            className="shadow-lg border-none z-10"
          />
        </div>
        Are you sure logout?
      </Modal>
    </>
  );
};

export default Navigation;
