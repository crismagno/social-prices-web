import useAuthData from "../../../data/hook/useAuthData";
import Urls from "../../../shared/common/routes-app/routes-app";
import Avatar from "../../common/Avatar/Avatar";
import {
  IconAdjustmentsHorizontal,
  IconBell,
  IconBuildingStoreFront,
  IconHome,
  IconLogout,
} from "../../common/icons/icons";
import NavigationItem from "./NavigationItem";

interface Props {}

const Navigation: React.FC<Props> = ({}) => {
  const { user, logout } = useAuthData();

  return (
    <div
      className="max-h-24 flex flex-row 
      shadow-lg shadow-slate-600 dark:shadow-white 
     bg-white dark:bg-gray-800 dark:text-white w-screen overflow-x-auto
      fixed bottom-0 left-0"
    >
      <ul className="flex flex-row grow">
        <NavigationItem text="Profile" url={Urls.PROFILE} title="Logo Name">
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
          text="Store"
          url={Urls.STORE}
        />
      </ul>

      <ul className="flex flex-row">
        <NavigationItem
          icon={IconLogout}
          text={"Logout"}
          onClick={logout}
          className="
            text-red-600 hover:bg-red-300 hover:text-white
            dark:text-white dark:hover:bg-slate-700"
        />
      </ul>
    </div>
  );
};

export default Navigation;
