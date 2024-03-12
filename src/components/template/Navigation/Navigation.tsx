import { useState } from "react";

import { Modal } from "antd";

import useAuthData from "../../../data/hook/useAuthData";
import Urls from "../../../shared/common/routes-app/routes-app";
import Avatar from "../../common/Avatar/Avatar";
import {
  IconAdjustmentsHorizontal,
  IconBell,
  IconBuildingStoreFront,
  IconHome,
  IconLogout,
  IconSquare2x2,
} from "../../common/icons/icons";
import NavigationItem from "./NavigationItem";

interface Props {}

const Navigation: React.FC<Props> = ({}) => {
  const { user, logout } = useAuthData();

  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  return (
    <div
      className="max-h-24 flex flex-row 
      shadow-lg shadow-slate-600 dark:shadow-white 
     bg-white dark:bg-gray-800 dark:text-white w-screen overflow-x-auto
      fixed bottom-0 left-0"
    >
      <ul className="flex flex-row grow">
        <NavigationItem text="Profile" url={Urls.PROFILE} title="Go to Profile">
          <Avatar src={user?.avatar} alt="Image logo" />
        </NavigationItem>

        <NavigationItem icon={IconHome} text="Home" url={Urls.DASHBOARD} />

        <NavigationItem
          icon={IconBell}
          text="Notifications"
          url={Urls.NOTIFICATIONS}
        />

        <NavigationItem
          icon={IconAdjustmentsHorizontal}
          text="Settings"
          url={Urls.SETTINGS}
        />

        <NavigationItem
          icon={IconBuildingStoreFront()}
          text="Stores"
          url={Urls.STORES}
        />
        <NavigationItem
          icon={IconSquare2x2()}
          text="Products"
          url={Urls.PRODUCTS}
        />
      </ul>

      <ul className="flex flex-row">
        <NavigationItem
          icon={IconLogout}
          text={"Logout"}
          onClick={() => setShowLogoutModal(true)}
          className="
            text-red-600 hover:bg-red-400 hover:text-white
            dark:text-white dark:hover:bg-slate-700"
        />
      </ul>

      <Modal
        open={showLogoutModal}
        title="Logout"
        destroyOnClose
        onCancel={() => setShowLogoutModal(false)}
        onOk={async () => {
          await logout();
          setShowLogoutModal(false);
        }}
        okText={"Yes"}
        cancelText={"No"}
      >
        Are you sure logout?
      </Modal>
    </div>
  );
};

export default Navigation;
