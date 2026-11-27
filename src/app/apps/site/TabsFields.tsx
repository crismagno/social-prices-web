"use client";

import { Button, Form, Input, Select, Space } from "antd";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  BLOCK_LIMITS,
  IStoreSiteBlock,
  IStoreSiteBlockItem,
  maxItemsOf,
  newBlockItem,
} from "../../../shared/business/store-sites/store-site-blocks";
import { canBeTab } from "../../../shared/business/store-sites/store-site-layout";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";

interface Props {
  section: IStoreSiteBlock;
  /** Every section of the page being built, the menu itself among them. */
  pageSections: IStoreSiteBlock[];
  /** Applied to the section as it is then. */
  onChange: (
    change: (section: IStoreSiteBlock) => Partial<IStoreSiteBlock>,
  ) => void;
}

const KEY = "storeSite.editor.builder.tabs";

/**
 * A menu of tabs: an optional title, and its items. Each item has a name and
 * the section of this page it shows; a section goes with one item only.
 */
const TabsFields = ({ section, pageSections, onChange }: Props) => {
  const { t } = useLanguageData();

  const setItems = (
    change: (items: IStoreSiteBlockItem[]) => IStoreSiteBlockItem[],
  ): void => onChange((current) => ({ items: change([...current.items]) }));

  const setItem = (key: string, patch: Partial<IStoreSiteBlockItem>): void =>
    setItems((items) =>
      items.map((item: IStoreSiteBlockItem) =>
        item.key === key ? { ...item, ...patch } : item,
      ),
    );

  const candidates: IStoreSiteBlock[] = pageSections.filter(
    (each: IStoreSiteBlock) => each.key !== section.key && canBeTab(each),
  );

  // Taken by another menu of this page: it cannot be shown twice.
  const takenElsewhere: Set<string | null> = new Set(
    pageSections
      .filter(
        (each: IStoreSiteBlock) =>
          each.type === StoreSitesEnum.BlockType.TABS &&
          each.key !== section.key,
      )
      .flatMap((each: IStoreSiteBlock) =>
        each.items.map((item: IStoreSiteBlockItem) => item.sectionKey),
      ),
  );

  const nameOf = (each: IStoreSiteBlock): string => {
    const type: string = t(`storeSite.editor.builder.types.${each.type}`);

    return each.title?.trim() ? `${type}: ${each.title.trim()}` : type;
  };

  const optionsFor = (item: IStoreSiteBlockItem) =>
    candidates.map((each: IStoreSiteBlock) => ({
      value: each.key,
      label: nameOf(each),
      disabled:
        takenElsewhere.has(each.key) ||
        section.items.some(
          (other: IStoreSiteBlockItem) =>
            other.key !== item.key && other.sectionKey === each.key,
        ),
    }));

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
      <Space direction="vertical" className="w-full mb-2">
        {section.items.map((item: IStoreSiteBlockItem, index: number) => (
          <div key={item.key} className="flex gap-1 items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Input
                maxLength={BLOCK_LIMITS.itemTitle}
                placeholder={t(`${KEY}.namePlaceholder`)}
                value={item.title ?? ""}
                onChange={(event) =>
                  setItem(item.key, { title: event.target.value })
                }
              />
              <Select
                className="w-full"
                allowClear
                placeholder={t(`${KEY}.sectionPlaceholder`)}
                notFoundContent={t(`${KEY}.noSections`)}
                // A section that left the page is no longer a choice.
                value={
                  candidates.some(
                    (each: IStoreSiteBlock) => each.key === item.sectionKey,
                  )
                    ? item.sectionKey
                    : undefined
                }
                options={optionsFor(item)}
                onChange={(sectionKey?: string | null) =>
                  setItem(item.key, { sectionKey: sectionKey ?? null })
                }
              />
            </div>
            <Space direction="vertical" size={2}>
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
          </div>
        ))}
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
