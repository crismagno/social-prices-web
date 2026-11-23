"use client";

import { ReactNode } from "react";

import {
  AimOutlined,
  AppstoreOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FieldNumberOutlined,
  OrderedListOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  StarOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Collapse,
  Dropdown,
  Empty,
  Popconfirm,
  Space,
  Tag,
  Typography,
} from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IStoreSiteBlock,
  MAX_BLOCKS,
  newBlock,
} from "../../../shared/business/store-sites/store-site-blocks";
import { IStoreSitePage } from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import BlockFields from "./BlockFields";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

/** The icon of each kind of block, in the editor. */
export const BLOCK_TYPE_ICONS: Record<StoreSitesEnum.BlockType, ReactNode> = {
  [StoreSitesEnum.BlockType.TEAM]: <TeamOutlined />,
  [StoreSitesEnum.BlockType.TESTIMONIALS]: <StarOutlined />,
  [StoreSitesEnum.BlockType.LOGOS]: <AppstoreOutlined />,
  [StoreSitesEnum.BlockType.FEATURES]: <ThunderboltOutlined />,
  [StoreSitesEnum.BlockType.FAQ]: <QuestionCircleOutlined />,
  [StoreSitesEnum.BlockType.STATS]: <FieldNumberOutlined />,
  [StoreSitesEnum.BlockType.STEPS]: <OrderedListOutlined />,
  [StoreSitesEnum.BlockType.CTA]: <AimOutlined />,
};

interface Props {
  editor: IStoreSiteEditor;
  storeId: string;
}

/**
 * The blocks of the site: team, testimonials, logos, features, questions,
 * numbers, steps and calls to action, each on the home or on a page, in the
 * order they are listed.
 */
const BlocksTab = ({ editor, storeId }: Props) => {
  const { t } = useLanguageData();

  if (!editor.draft) {
    return null;
  }

  const blocks: IStoreSiteBlock[] = editor.draft.blocks;
  const pages: IStoreSitePage[] = editor.draft.pages;

  const setBlocks = (
    change: (blocks: IStoreSiteBlock[]) => IStoreSiteBlock[],
  ): void => editor.update((draft) => ({ blocks: change(draft.blocks) }));

  const setBlock = (
    key: string,
    change: (block: IStoreSiteBlock) => Partial<IStoreSiteBlock>,
  ): void =>
    setBlocks((current) =>
      current.map((block: IStoreSiteBlock) =>
        block.key === key ? { ...block, ...change(block) } : block,
      ),
    );

  const move = (from: number, to: number): void =>
    setBlocks((current) => {
      const next: IStoreSiteBlock[] = [...current];
      const [moved] = next.splice(from, 1);

      next.splice(to, 0, moved);

      return next;
    });

  const pageTag = (block: IStoreSiteBlock): ReactNode => {
    if (block.pageKey === null) {
      return <Tag>{t("storeSite.editor.blocks.home")}</Tag>;
    }

    const page: IStoreSitePage | undefined = pages.find(
      (each: IStoreSitePage) => each.key === block.pageKey,
    );

    return page ? (
      <Tag>{page.label ?? t(`storeSite.pages.types.${page.type}`)}</Tag>
    ) : (
      <Tag color="red">{t("storeSite.editor.blocks.removedPage")}</Tag>
    );
  };

  const isFull: boolean = blocks.length >= MAX_BLOCKS;

  const addMenu = Object.values(StoreSitesEnum.BlockType).map(
    (type: StoreSitesEnum.BlockType) => ({
      key: type,
      icon: BLOCK_TYPE_ICONS[type],
      label: (
        <div style={{ lineHeight: 1.3, padding: "2px 0" }}>
          <div style={{ fontWeight: 600 }}>
            {t(`storeSite.editor.blocks.types.${type}.name`)}
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {t(`storeSite.editor.blocks.types.${type}.hint`)}
          </Typography.Text>
        </div>
      ),
    }),
  );

  return (
    <Space direction="vertical" size={14} style={{ width: "100%" }}>
      <Alert type="info" showIcon message={t("storeSite.editor.blocks.hint")} />

      <Dropdown
        disabled={isFull}
        trigger={["click"]}
        menu={{
          items: addMenu,
          onClick: ({ key }) =>
            setBlocks((current) => [
              ...current,
              newBlock(key as StoreSitesEnum.BlockType, t),
            ]),
        }}
      >
        <Button type="primary" icon={<PlusOutlined />} block>
          {t("storeSite.editor.blocks.add")} ({blocks.length}/{MAX_BLOCKS})
        </Button>
      </Dropdown>

      {blocks.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("storeSite.editor.blocks.empty")}
        />
      ) : (
        <Collapse
          accordion
          items={blocks.map((block: IStoreSiteBlock, index: number) => ({
            key: block.key,
            label: (
              <Space size={6} wrap>
                {BLOCK_TYPE_ICONS[block.type]}
                <Typography.Text
                  strong
                  delete={!block.isActive}
                  ellipsis
                  style={{ maxWidth: 150 }}
                >
                  {block.title?.trim() ||
                    t(`storeSite.editor.blocks.types.${block.type}.name`)}
                </Typography.Text>
                {pageTag(block)}
              </Space>
            ),
            extra: (
              <Space size={0} onClick={(event) => event.stopPropagation()}>
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
                  disabled={index === blocks.length - 1}
                  aria-label={t("storeSite.editor.moveDown")}
                  onClick={() => move(index, index + 1)}
                />
                <Button
                  type="text"
                  size="small"
                  icon={block.isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  aria-label={t(
                    block.isActive
                      ? "storeSite.editor.blocks.hide"
                      : "storeSite.editor.blocks.show",
                  )}
                  title={t(
                    block.isActive
                      ? "storeSite.editor.blocks.hide"
                      : "storeSite.editor.blocks.show",
                  )}
                  onClick={() =>
                    setBlock(block.key, (current) => ({
                      isActive: !current.isActive,
                    }))
                  }
                />
                <Popconfirm
                  title={t("storeSite.editor.blocks.removeConfirm")}
                  okText={t("storeSite.editor.remove")}
                  okButtonProps={{ danger: true }}
                  onConfirm={() =>
                    setBlocks((current) =>
                      current.filter(
                        (each: IStoreSiteBlock) => each.key !== block.key,
                      ),
                    )
                  }
                >
                  <Button
                    type="primary"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    aria-label={t("storeSite.editor.remove")}
                    style={{ marginLeft: 4 }}
                  />
                </Popconfirm>
              </Space>
            ),
            children: (
              <BlockFields
                block={block}
                pages={pages}
                storeId={storeId}
                onChange={(change) => setBlock(block.key, change)}
              />
            ),
          }))}
        />
      )}
    </Space>
  );
};

export default BlocksTab;
