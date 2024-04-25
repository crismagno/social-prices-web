import "./styles.scss";

import { Menu, MenuProps, message } from "antd";

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
          [getItem("Create Sale", "sub11", <ShoppingCartOutlined />)],
          "group"
        ),
      ]
    ),
  ];

  const onClick: MenuProps["onClick"] = (e) => {
    message.info("test");
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
