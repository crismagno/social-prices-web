"use client";

import { Button, Form, Tag } from "antd";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  HolderOutlined,
  HomeOutlined,
} from "@ant-design/icons";

import FeatureIcon from "../../../components/store-site/shared/blocks/FeatureIcon";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { siteHeaderOf } from "../../../shared/business/store-sites/store-site-header";
import {
  IStoreSitePage,
  sitePagesOf,
} from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import useDragReorder from "./useDragReorder";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
}

/** The home among the pages of the menu: it has no page of its own. */
const HOME: string = "__home__";

/**
 * The order of the menu: the home and the pages the owner put in it, dragged
 * (or moved with the arrows) into place. Moving a page changes the order of
 * the pages themselves, the same one the pages tab shows.
 */
const MenuOrderFields = ({ editor }: Props) => {
  const { t } = useLanguageData();

  // The keys of the menu in order, the home where it was put, from a draft.
  const orderOf = (draft: NonNullable<IStoreSiteEditor["draft"]>): string[] => {
    const { home } = siteHeaderOf(draft.header);

    const keys: string[] = sitePagesOf(draft.pages)
      .filter((page: IStoreSitePage) => page.isInMenu)
      .map((page: IStoreSitePage) => page.key);

    if (home.isInMenu) {
      keys.splice(Math.min(home.position, keys.length), 0, HOME);
    }

    return keys;
  };

  // From the draft as it is when applied, like every change of the editor.
  const move = (from: number, to: number): void =>
    editor.update((draft) => {
      const order: string[] = orderOf(draft);

      order.splice(to, 0, order.splice(from, 1)[0]);

      const pageKeys: string[] = order.filter((key: string) => key !== HOME);
      const pages: IStoreSitePage[] = sitePagesOf(draft.pages);

      // The pages of the menu take their new order in the places they had;
      // a page out of the menu stays where it is.
      let next: number = 0;

      const reordered: IStoreSitePage[] = pages.map((page: IStoreSitePage) =>
        page.isInMenu
          ? (pages.find(
              (each: IStoreSitePage) => each.key === pageKeys[next++],
            ) ?? page)
          : page,
      );

      const header = siteHeaderOf(draft.header);

      return {
        pages: reordered,
        header: {
          ...header,
          home: {
            ...header.home,
            position: Math.max(0, order.indexOf(HOME)),
          },
        },
      };
    });

  const drag = useDragReorder(move);

  if (!editor.draft) {
    return null;
  }

  const pages: IStoreSitePage[] = sitePagesOf(editor.draft.pages);
  const order: string[] = orderOf(editor.draft);

  const labelOf = (key: string): string => {
    if (key === HOME) {
      return (
        siteHeaderOf(editor.draft?.header).home.label ??
        t("storeSite.pages.home")
      );
    }

    const page: IStoreSitePage | undefined = pages.find(
      (each: IStoreSitePage) => each.key === key,
    );

    if (!page) {
      return key;
    }

    // As the menu names it: its own name, else its kind's.
    return (
      page.label?.trim() ||
      page.title?.trim() ||
      (page.type === StoreSitesEnum.SitePageType.CUSTOM
        ? page.slug
        : t(`storeSite.pages.types.${page.type}`))
    );
  };

  const iconOf = (key: string) => {
    const icon = pages.find((each: IStoreSitePage) => each.key === key)?.icon;

    return icon ? <FeatureIcon icon={icon} /> : null;
  };

  if (order.length < 2) {
    return null;
  }

  return (
    <Form.Item
      label={t("storeSite.editor.header.menuOrder")}
      extra={t("storeSite.editor.header.menuOrderHint")}
    >
      <div className="flex flex-col gap-2">
        {order.map((key: string, index: number) => (
          <div
            key={key}
            className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5"
            {...drag.itemProps(index)}
          >
            <HolderOutlined className="opacity-50" />
            {iconOf(key)}
            <span className="flex-1 truncate font-medium">{labelOf(key)}</span>
            {key === HOME && (
              <Tag className="m-0" icon={<HomeOutlined />}>
                {t("storeSite.pages.home")}
              </Tag>
            )}
            <Button
              type="text"
              size="small"
              icon={<ArrowUpOutlined />}
              disabled={index === 0}
              aria-label={t("storeSite.editor.moveUp")}
              onClick={() => move(index, index - 1)}
            />
            <Button
              type="text"
              size="small"
              icon={<ArrowDownOutlined />}
              disabled={index === order.length - 1}
              aria-label={t("storeSite.editor.moveDown")}
              onClick={() => move(index, index + 1)}
            />
          </div>
        ))}
      </div>
    </Form.Item>
  );
};

export default MenuOrderFields;
