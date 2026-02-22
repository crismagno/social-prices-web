import './styles.scss';

import {
  Menu,
  MenuProps,
} from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import {
  AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime.shared-runtime';
import { useRouter } from 'next/navigation';

import {
  TagOutlined,
  TeamOutlined,
} from '@ant-design/icons';

import useAuthData from '../../../../data/context/auth/useAuthData';
import useLanguageData from '../../../../data/context/language/useLanguageData';
import EmployeesEnum
  from '../../../../shared/business/employees/employees.enum';
import Urls from '../../../../shared/common/routes-app/routes-app';
import { IconQuestion } from '../../../common/icons/icons';
import {
  getItem,
  MenuItem,
} from '../../../utils/navigation/navigation.util';
import NavigationItem from '../NavigationItem';

interface Props {}

export const GeneralMenu: React.FC<Props> = ({}) => {
  const { t } = useLanguageData();

  const { employee } = useAuthData();

  const router: AppRouterInstance = useRouter();

  const itemsSub1: ItemType[] = [
    getItem(
      t("navigation.general"),
      null,
      null,
      [getItem(t("navigation.tags"), Urls.TAGS, <TagOutlined />)],
      "group"
    ),
  ];

  if (employee?.level !== EmployeesEnum.Level.EMPLOYEE) {
    itemsSub1.push(
      getItem(
        t("navigation.employees"),
        null,
        null,
        [getItem(t("navigation.employees"), Urls.EMPLOYEES, <TeamOutlined />)],
        "group"
      )
    );
  }

  const items: MenuItem[] = [
    getItem(
      <NavigationItem
        icon={IconQuestion()}
        text={t("navigation.general")}
        url={Urls.TAGS}
      />,
      "sub1",
      null,
      itemsSub1
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
