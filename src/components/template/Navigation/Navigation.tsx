import useAuthData from "../../../data/hook/useAuthData";
import Urls from "../../../shared/common/routes/routes";
import {
  IconAdjustmentsHorizontal,
  IconBell,
  IconHome,
  IconLogout,
} from "../../elements/icons/icons";
import NavigationItem from "./NavigationItem";

interface Props {}

const Navigation: React.FC<Props> = ({}) => {
  const { user, logout } = useAuthData();

  const srcLogo: string = user?.imageUrl ?? "/avatar-default.png";

  return (
    <div className="h-20 flex flex-row">
      <ul className="flex flex-row grow">
        <NavigationItem text="Profile" url={Urls.PROFILE} title="Logo Name">
          <img
            src={srcLogo}
            alt="Image logo"
            className="rounded-full shadow"
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
      </ul>
      <ul className="flex flex-row">
        <NavigationItem
          icon={IconLogout}
          text={"Logout"}
          onClick={logout}
          className="text-red-600 hover:bg-red-100 hover:text-gray-700"
        />
      </ul>
    </div>
  );
};

export default Navigation;
