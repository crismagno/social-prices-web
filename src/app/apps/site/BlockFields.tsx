"use client";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Card, Form, Input, Select, Space } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  BLOCK_LIMITS,
  IStoreSiteBlock,
  IStoreSiteBlockButton,
  IStoreSiteBlockItem,
  maxItemsOf,
  newBlockButton,
  newBlockItem,
} from "../../../shared/business/store-sites/store-site-blocks";
import { IStoreSitePage } from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import BlockItemFields from "./BlockItemFields";
import ButtonFields, { HOME_PAGE } from "./ButtonFields";


interface Props {
  block: IStoreSiteBlock;
  pages: IStoreSitePage[];
  storeId: string;
  /** Applied to the block as it is then. */
  onChange: (change: (block: IStoreSiteBlock) => Partial<IStoreSiteBlock>) => void;
  /** A piece without a list (a text) shows no items. */
  showItems?: boolean;
}

const move = <T,>(list: T[], from: number, to: number): T[] => {
  const next: T[] = [...list];
  const [moved] = next.splice(from, 1);

  next.splice(to, 0, moved);

  return next;
};

/** The fields of one block: where it shows, its heading, its items or button. */
const BlockFields = ({
  block,
  pages,
  storeId,
  onChange,
  showItems = true,
}: Props) => {
  const { t } = useLanguageData();

  const pageName = (page: IStoreSitePage): string =>
    page.label ?? t(`storeSite.pages.types.${page.type}`);

  const pageOptions = [
    { value: HOME_PAGE, label: t("storeSite.editor.blocks.home") },
    ...pages.map((page: IStoreSitePage) => ({
      value: page.key,
      label: pageName(page),
    })),
  ];

  const setItem = (key: string, patch: Partial<IStoreSiteBlockItem>): void =>
    onChange((current: IStoreSiteBlock) => ({
      items: current.items.map((item: IStoreSiteBlockItem) =>
        item.key === key ? { ...item, ...patch } : item,
      ),
    }));

  const setButton = (patch: Partial<IStoreSiteBlockButton>): void =>
    onChange((current: IStoreSiteBlock) => ({
      button: newBlockButton({ ...current.button, ...patch }),
    }));

  const isCta: boolean = block.type === StoreSitesEnum.BlockType.CTA;
  const max: number = maxItemsOf(block.type);
  const button: IStoreSiteBlockButton | null = block.button;

  return (
    <>
      <Form layout="vertical">
        <Form.Item label={t("storeSite.editor.blocks.page")}>
          <Select
            value={block.pageKey ?? HOME_PAGE}
            options={
              block.pageKey &&
              !pages.some((page: IStoreSitePage) => page.key === block.pageKey)
                ? [
                    ...pageOptions,
                    {
                      value: block.pageKey,
                      label: t("storeSite.editor.blocks.removedPage"),
                    },
                  ]
                : pageOptions
            }
            onChange={(value: string) =>
              onChange(() => ({ pageKey: value === HOME_PAGE ? null : value }))
            }
          />
        </Form.Item>
        <Form.Item label={t("storeSite.editor.blocks.kicker")}>
          <Input
            maxLength={BLOCK_LIMITS.kicker}
            value={block.kicker ?? ""}
            onChange={(event) =>
              onChange(() => ({ kicker: event.target.value }))
            }
          />
        </Form.Item>
        <Form.Item label={t("storeSite.editor.blocks.title")}>
          <Input
            maxLength={BLOCK_LIMITS.title}
            value={block.title ?? ""}
            onChange={(event) => onChange(() => ({ title: event.target.value }))}
          />
        </Form.Item>
        <Form.Item label={t("storeSite.editor.blocks.subtitle")}>
          <Input.TextArea
            autoSize={{
              minRows: block.type === StoreSitesEnum.BlockType.TEXT ? 4 : 1,
              maxRows: block.type === StoreSitesEnum.BlockType.TEXT ? 14 : 4,
            }}
            maxLength={
              block.type === StoreSitesEnum.BlockType.TEXT
                ? BLOCK_LIMITS.textBody
                : BLOCK_LIMITS.subtitle
            }
            value={block.subtitle ?? ""}
            onChange={(event) =>
              onChange(() => ({ subtitle: event.target.value }))
            }
          />
        </Form.Item>

        {isCta && (
          <ButtonFields button={button} pages={pages} onChange={setButton} />
        )}
      </Form>

      {!isCta && showItems && (
        <Space direction="vertical" style={{ width: "100%" }} size={10}>
          {block.items.map((item: IStoreSiteBlockItem, index: number) => (
            <Card
              key={item.key}
              size="small"
              title={`${t("storeSite.editor.blocks.item")} ${index + 1}`}
              extra={
                <Space size={2}>
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowUpOutlined />}
                    disabled={index === 0}
                    aria-label={t("storeSite.editor.moveUp")}
                    onClick={() =>
                      onChange((current) => ({
                        items: move(current.items, index, index - 1),
                      }))
                    }
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowDownOutlined />}
                    disabled={index === block.items.length - 1}
                    aria-label={t("storeSite.editor.moveDown")}
                    onClick={() =>
                      onChange((current) => ({
                        items: move(current.items, index, index + 1),
                      }))
                    }
                  />
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={t("storeSite.editor.remove")}
                    onClick={() =>
                      onChange((current) => ({
                        items: current.items.filter(
                          (each: IStoreSiteBlockItem) => each.key !== item.key,
                        ),
                      }))
                    }
                  />
                </Space>
              }
            >
              <BlockItemFields
                type={block.type}
                item={item}
                storeId={storeId}
                pages={pages}
                onChange={(patch) => setItem(item.key, patch)}
              />
            </Card>
          ))}
          <Button
            block
            type="dashed"
            icon={<PlusOutlined />}
            disabled={block.items.length >= max}
            onClick={() =>
              onChange((current) => ({
                items: [...current.items, newBlockItem(current.type)],
              }))
            }
          >
            {t("storeSite.editor.blocks.addItem")} ({block.items.length}/{max})
          </Button>
        </Space>
      )}
    </>
  );
};

export default BlockFields;
