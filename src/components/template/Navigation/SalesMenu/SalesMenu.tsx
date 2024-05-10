import "./styles.scss";

import { Menu, MenuProps } from "antd";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { ShoppingCartOutlined } from "@ant-design/icons";

import Urls from "../../../../shared/common/routes-app/routes-app";
import { IconCart } from "../../../common/icons/icons";
import NavigationItem from "../NavigationItem";

type MenuItem = Required<MenuProps>["items"][number];

const getItem = (
  label: React.ReactNode,
  key?: React.Key | null,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: "group"
): MenuItem =>
  ({
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem);

interface Props {}

export const SalesMenu: React.FC<Props> = ({}) => {
  const router: AppRouterInstance = useRouter();

  const items: MenuItem[] = [
    getItem(
      <NavigationItem icon={IconCart()} text="Sales" url={Urls.SALES} />,
      "sub1",
      null,
      [
        getItem(
          "Sales",
          null,
          null,
          [getItem("Create Sale", Urls.SALES, <ShoppingCartOutlined />)],
          "group"
        ),
      ]
    ),
  ];

  const onClick: MenuProps["onClick"] = (e) => {
    router.push(e.key);
  };

  return (
    <Menu
      onClick={onClick}
      mode="horizontal"
      items={items}
      style={{ paddingLeft: 0 }}
    />
  );
};
