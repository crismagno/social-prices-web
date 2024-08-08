import "./styles.scss";

import { Menu, MenuProps } from "antd";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { ShoppingCartOutlined } from "@ant-design/icons";

import Urls from "../../../../shared/common/routes-app/routes-app";
import { IconCart } from "../../../common/icons/icons";
import { getItem, MenuItem } from "../../../utils/navigation/navigation";
import NavigationItem from "../NavigationItem";

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
          [
            getItem("Sales", Urls.SALES, <ShoppingCartOutlined />),
            getItem("Create Sale", Urls.SALES_CREATE, <ShoppingCartOutlined />),
          ],
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
