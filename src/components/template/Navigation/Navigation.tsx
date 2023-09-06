import useAuthData from "../../../data/hook/useAuthData";
import Urls from "../../../shared/common/routes-app/routes-app";
import {
  IconAdjustmentsHorizontal,
  IconBell,
  IconBuildingStoreFront,
  IconHome,
  IconLogout,
} from "../../elements/icons/icons";
import NavigationItem from "./NavigationItem";

interface Props {}

const Navigation: React.FC<Props> = ({}) => {
  const { user, logout } = useAuthData();

  const srcLogo: string = user?.imageUrl ?? "/avatar-default.png";

  return (
    <div
      className="h-20 flex flex-row shadow-white shadow-md
     dark:bg-gray-800 dark:text-white"
    >
      <ul className="flex flex-row grow">
        <NavigationItem text="Profile" url={Urls.PROFILE} title="Logo Name">
          <img
            src={srcLogo}
            alt="Image logo"
            className="rounded-full shadow-md"
            onError={() => (
              <img
                src={"/avatar-default.png"}
                alt="Image logo"
                className="rounded-full"
                width={"50%"}
                height={"50%"}
              />
            )}
            width={"50%"}
            height={"50%"}
          />
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
