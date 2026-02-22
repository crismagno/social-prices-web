import "./styles.scss";

import { Menu, MenuProps } from "antd";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { ShoppingCartOutlined } from "@ant-design/icons";

import useLanguageData from "../../../../data/context/language/useLanguageData";
import Urls from "../../../../shared/common/routes-app/routes-app";
import { IconCart } from "../../../common/icons/icons";
import { getItem, MenuItem } from "../../../utils/navigation/navigation.util";
import NavigationItem from "../NavigationItem";

interface Props {}

export const SalesMenu: React.FC<Props> = ({}) => {
  const { t } = useLanguageData();
  const router: AppRouterInstance = useRouter();

  const items: MenuItem[] = [
    getItem(
      <NavigationItem
        icon={IconCart()}
        text={t("navigation.sales")}
        url={Urls.SALES}
      />,
      "sub1",
      null,
      [
        getItem(
          t("navigation.sales"),
          null,
          null,
          [
            getItem(
              t("navigation.sales"),
              Urls.SALES,
              <ShoppingCartOutlined />
            ),
            getItem(
              t("sales.createSale"),
              Urls.SALES_CREATE,
              <ShoppingCartOutlined />
            ),
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
      className="px-0 border-b-0"
    />
  );
};
