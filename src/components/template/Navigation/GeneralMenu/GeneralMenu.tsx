import "./styles.scss";

import { Menu, MenuProps } from "antd";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { TagOutlined, TeamOutlined } from "@ant-design/icons";

import Urls from "../../../../shared/common/routes-app/routes-app";
import { IconQuestion } from "../../../common/icons/icons";
import { getItem, MenuItem } from "../../../utils/navigation/navigation";
import NavigationItem from "../NavigationItem";

interface Props {}

export const GeneralMenu: React.FC<Props> = ({}) => {
  const router: AppRouterInstance = useRouter();

  const items: MenuItem[] = [
    getItem(
      <NavigationItem icon={IconQuestion()} text="General" url={Urls.TAGS} />,
      "sub1",
      null,
      [
        getItem(
          "General",
          null,
          null,
          [getItem("Tags", Urls.TAGS, <TagOutlined />)],
          "group"
        ),
        getItem(
          "Employees",
          null,
          null,
          [getItem("Employees", Urls.EMPLOYEES, <TeamOutlined />)],
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
