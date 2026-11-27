"use client";

import { Button, Card, Dropdown, Form, Input, Select, Space } from "antd";
import type { MenuProps } from "antd";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  BLOCK_LIMITS,
  IStoreSiteBlock,
  IStoreSiteBlockItem,
  MAX_TAB_SECTIONS,
  maxItemsOf,
  newBlockItem,
} from "../../../shared/business/store-sites/store-site-blocks";
import {
  ITabOwner,
  canBeTab,
  tabOwnersOf,
} from "../../../shared/business/store-sites/store-site-layout";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { SECTION_ICONS } from "./section-icons";
import { ISiteBuilder } from "./useSiteBuilder";

interface Props {
  section: IStoreSiteBlock;
  builder: ISiteBuilder;
}

const KEY = "storeSite.editor.builder.tabs";

/** What can be made for an item: anything but the template's own parts and a menu. */
const NEW_TYPES: StoreSitesEnum.BlockType[] = [
  ...StoreSitesEnum.PIECE_TYPES,
  ...StoreSitesEnum.CONTENT_BLOCK_TYPES,
].filter(
  (type: StoreSitesEnum.BlockType) => type !== StoreSitesEnum.BlockType.TABS,
);

/**
 * A menu of tabs: an optional title, and its items. Each item has a name and
 * what it shows: sections already on this page, picked from a list, and new
 * ones made right here (a text, an image, a block...), as many as wanted. A
 * section goes with one item only; what an item shows follows the order of
 * the page.
 */
const TabsFields = ({ section, builder }: Props) => {
  const { t } = useLanguageData();

  const onChange = (
    change: (current: IStoreSiteBlock) => Partial<IStoreSiteBlock>,
  ): void => builder.updateSection(section.key, change);

  const setItems = (
    change: (items: IStoreSiteBlockItem[]) => IStoreSiteBlockItem[],
  ): void => onChange((current) => ({ items: change([...current.items]) }));

  const setItem = (
    key: string,
    change: (item: IStoreSiteBlockItem) => Partial<IStoreSiteBlockItem>,
  ): void =>
    setItems((items) =>
      items.map((item: IStoreSiteBlockItem) =>
        item.key === key ? { ...item, ...change(item) } : item,
      ),
    );

  const owners: Map<string, ITabOwner> = tabOwnersOf(builder.sections);

  const nameOf = (each: IStoreSiteBlock): string => {
    const type: string = t(`storeSite.editor.builder.types.${each.type}`);

    return each.title?.trim() ? `${type}: ${each.title.trim()}` : type;
  };

  // What an item shows, in the order of the page.
  const shownBy = (item: IStoreSiteBlockItem): IStoreSiteBlock[] =>
    builder.sections.filter(
      (each: IStoreSiteBlock) =>
        owners.get(each.key)?.tabsKey === section.key &&
        owners.get(each.key)?.itemKey === item.key,
    );

  // What is free to be shown: on the page, and shown by no item yet.
  const free: IStoreSiteBlock[] = builder.sections.filter(
    (each: IStoreSiteBlock) =>
      each.key !== section.key && canBeTab(each) && !owners.has(each.key),
  );

  const newMenu = (item: IStoreSiteBlockItem): MenuProps => ({
    style: { maxHeight: 320, overflowY: "auto" },
    items: NEW_TYPES.map((type: StoreSitesEnum.BlockType) => ({
      key: type,
      icon: SECTION_ICONS[type],
      label: t(`storeSite.editor.builder.types.${type}`),
      disabled: !builder.canAdd(type),
    })),
    onClick: ({ key }) =>
      builder.addToTab(section.key, item.key, key as StoreSitesEnum.BlockType),
  });

  const max: number = maxItemsOf(section.type);

  return (
    <>
      <Form.Item label={t(`${KEY}.title`)}>
        <Input
          maxLength={BLOCK_LIMITS.title}
          allowClear
          value={section.title ?? ""}
          onChange={(event) =>
            onChange(() => ({ title: event.target.value || null }))
          }
        />
      </Form.Item>

      <div className="font-medium mb-1">{t(`${KEY}.items`)}</div>
      <p className="text-xs opacity-70 mb-2">{t(`${KEY}.hint`)}</p>
      <Space direction="vertical" className="w-full mb-2" size={10}>
        {section.items.map((item: IStoreSiteBlockItem, index: number) => {
          const shown: IStoreSiteBlock[] = shownBy(item);
          const isFull: boolean = item.sectionKeys.length >= MAX_TAB_SECTIONS;

          return (
            <Card
              key={item.key}
              size="small"
              title={
                <Input
                  variant="borderless"
                  className="!px-0 font-medium"
                  maxLength={BLOCK_LIMITS.itemTitle}
                  placeholder={t(`${KEY}.namePlaceholder`)}
                  value={item.title ?? ""}
                  onChange={(event) =>
                    setItem(item.key, () => ({ title: event.target.value }))
                  }
                />
              }
              extra={
                <Space size={2}>
                  <Button
                    size="small"
                    type="text"
                    icon={<ArrowUpOutlined />}
                    disabled={index === 0}
                    aria-label={t("storeSite.editor.moveUp")}
                    onClick={() =>
                      setItems((items) => {
                        items.splice(index - 1, 0, items.splice(index, 1)[0]);
                        return items;
                      })
                    }
                  />
                  <Button
                    size="small"
                    type="text"
                    icon={<ArrowDownOutlined />}
                    disabled={index === section.items.length - 1}
                    aria-label={t("storeSite.editor.moveDown")}
                    onClick={() =>
                      setItems((items) => {
                        items.splice(index + 1, 0, items.splice(index, 1)[0]);
                        return items;
                      })
                    }
                  />
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={t("storeSite.editor.remove")}
                    onClick={() =>
                      setItems((items) =>
                        items.filter(
                          (each: IStoreSiteBlockItem) => each.key !== item.key,
                        ),
                      )
                    }
                  />
                </Space>
              }
            >
              {shown.length === 0 ? (
                <p className="text-xs opacity-70 mb-2">{t(`${KEY}.empty`)}</p>
              ) : (
                <ul className="m-0 mb-2 flex list-none flex-col gap-1 p-0">
                  {shown.map((each: IStoreSiteBlock) => (
                    <li
                      key={each.key}
                      className="flex items-center gap-2 rounded-lg bg-black/5 px-2 py-1 dark:bg-white/10"
                    >
                      <span className="opacity-70">
                        {SECTION_ICONS[each.type]}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {nameOf(each)}
                      </span>
                      <Button
                        size="small"
                        type="text"
                        icon={<EditOutlined />}
                        title={t(`${KEY}.editSection`)}
                        aria-label={t(`${KEY}.editSection`)}
                        onClick={() => builder.select(each.key)}
                      />
                      <Button
                        size="small"
                        type="text"
                        icon={<CloseOutlined />}
                        title={t(`${KEY}.unlink`)}
                        aria-label={t(`${KEY}.unlink`)}
                        onClick={() =>
                          setItem(item.key, (current) => ({
                            sectionKeys: current.sectionKeys.filter(
                              (key: string) => key !== each.key,
                            ),
                          }))
                        }
                      />
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap gap-2">
                <Dropdown
                  menu={newMenu(item)}
                  trigger={["click"]}
                  disabled={isFull}
                >
                  <Button size="small" type="primary" icon={<PlusOutlined />}>
                    {t(`${KEY}.create`)}
                  </Button>
                </Dropdown>
                <Select
                  size="small"
                  className="min-w-[160px] flex-1"
                  placeholder={t(`${KEY}.sectionPlaceholder`)}
                  notFoundContent={t(`${KEY}.noSections`)}
                  disabled={isFull}
                  // Only picks: what is shown is the list above.
                  value={null}
                  options={free.map((each: IStoreSiteBlock) => ({
                    value: each.key,
                    label: nameOf(each),
                  }))}
                  onChange={(sectionKey: string | null) => {
                    if (sectionKey) {
                      setItem(item.key, (current) => ({
                        sectionKeys: [...current.sectionKeys, sectionKey],
                      }));
                    }
                  }}
                />
              </div>
            </Card>
          );
        })}
      </Space>
      <Button
        icon={<PlusOutlined />}
        disabled={section.items.length >= max}
        onClick={() =>
          setItems((items) => [
            ...items,
            newBlockItem(StoreSitesEnum.BlockType.TABS),
          ])
        }
      >
        {t(`${KEY}.add`)} ({section.items.length}/{max})
      </Button>
    </>
  );
};

export default TabsFields;
