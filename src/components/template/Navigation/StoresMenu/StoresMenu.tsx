import "./styles.scss";

import { Menu, MenuProps } from "antd";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";

import {
  AppstoreOutlined,
  HomeOutlined,
  ShoppingOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import useLanguageData from "../../../../data/context/language/useLanguageData";
import Urls from "../../../../shared/common/routes-app/routes-app";
import { IconBuildingStoreFront } from "../../../common/icons/icons";
import { getItem, MenuItem } from "../../../utils/navigation/navigation.util";
import NavigationItem from "../NavigationItem";

interface Props {}

export const StoresMenu: React.FC<Props> = ({}) => {
  const { t } = useLanguageData();
  const router: AppRouterInstance = useRouter();

  const items: MenuItem[] = [
    getItem(
      <NavigationItem
        icon={IconBuildingStoreFront()}
        text={t("navigation.stores")}
        url={Urls.STORES}
      />,
      Urls.STORES,
      null,
      [
        getItem(
          t("navigation.stores"),
          null,
          null,
          [
            getItem(t("navigation.stores"), Urls.STORES, <HomeOutlined />),
            getItem(
              t("navigation.customers"),
              Urls.CUSTOMERS,
              <TeamOutlined />,
            ),
          ],
          "group",
        ),
        getItem(
          t("navigation.products"),
          null,
          null,
          [
            getItem(
              t("navigation.products"),
              Urls.PRODUCTS,
              <AppstoreOutlined />,
            ),
            getItem(
              t("navigation.productItems"),
              Urls.PRODUCT_ITEMS,
              <ShoppingOutlined />,
            ),
          ],
          "group",
        ),
      ],
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
      className="px-0 border-b-0"
    />
  );
};
