import { ReactNode } from "react";

import {
  AimOutlined,
  AppstoreOutlined,
  BlockOutlined,
  BorderOutlined,
  ColumnHeightOutlined,
  DragOutlined,
  FieldNumberOutlined,
  FileTextOutlined,
  FontSizeOutlined,
  LayoutOutlined,
  LineOutlined,
  MenuOutlined,
  NotificationOutlined,
  OrderedListOutlined,
  PictureOutlined,
  PlaySquareOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  ShoppingOutlined,
  StarOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";

const T = StoreSitesEnum.BlockType;

/** The icon of each kind of section, in the editor. */
export const SECTION_ICONS: Record<StoreSitesEnum.BlockType, ReactNode> = {
  [T.HERO]: <LayoutOutlined />,
  [T.MARQUEE]: <NotificationOutlined />,
  [T.CARDS]: <BlockOutlined />,
  [T.PRODUCTS]: <ShoppingOutlined />,
  [T.ABOUT]: <ReadOutlined />,
  [T.PAGE_BODY]: <FileTextOutlined />,
  [T.TEXT]: <FontSizeOutlined />,
  [T.BUTTONS]: <AimOutlined />,
  [T.IMAGE]: <PictureOutlined />,
  [T.VIDEO]: <PlaySquareOutlined />,
  [T.BOX]: <BorderOutlined />,
  [T.TABS]: <MenuOutlined />,
  [T.SPACER]: <ColumnHeightOutlined />,
  [T.CANVAS]: <DragOutlined />,
  [T.DIVIDER]: <LineOutlined />,
  [T.TEAM]: <TeamOutlined />,
  [T.TESTIMONIALS]: <StarOutlined />,
  [T.LOGOS]: <AppstoreOutlined />,
  [T.FEATURES]: <ThunderboltOutlined />,
  [T.FAQ]: <QuestionCircleOutlined />,
  [T.STATS]: <FieldNumberOutlined />,
  [T.STEPS]: <OrderedListOutlined />,
  [T.CTA]: <NotificationOutlined />,
};
