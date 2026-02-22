import "./styles.scss";

import { Menu, MenuProps } from "antd";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import {
  AppstoreOutlined,
  BlockOutlined,
  HomeOutlined,
  ShoppingOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import Urls from "../../../../shared/common/routes-app/routes-app";
import { IconBuildingStoreFront } from "../../../common/icons/icons";
import { getItem, MenuItem } from "../../../utils/navigation/navigation.util";
import NavigationItem from "../NavigationItem";

interface Props {}

export const StoresMenu: React.FC<Props> = ({}) => {
  const router: AppRouterInstance = useRouter();

  const items: MenuItem[] = [
    getItem(
      <NavigationItem
        icon={IconBuildingStoreFront()}
        text="Stores"
        url={Urls.STORES}
      />,
      Urls.STORES,
      null,
      [
        getItem(
          "Stores",
          null,
          null,
          [
            getItem("Stores", Urls.STORES, <HomeOutlined />),
            getItem("Customers", Urls.CUSTOMERS, <TeamOutlined />),
            getItem("Categories", Urls.CATEGORIES, <BlockOutlined />),
          ],
          "group"
        ),
        getItem(
          "Products",
          null,
          null,
          [
            getItem("Products", Urls.PRODUCTS, <AppstoreOutlined />),
            getItem("Product Items", Urls.PRODUCT_ITEMS, <ShoppingOutlined />),
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
      style={{ paddingLeft: 0, paddingRight: 0 }}
    />
  );
};
