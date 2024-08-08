import { MenuProps } from "antd";
import MenuItem from "antd/es/menu/MenuItem";

export type MenuItem = Required<MenuProps>["items"][number];

export const getItem = (
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
