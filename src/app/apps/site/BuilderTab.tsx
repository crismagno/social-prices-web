"use client";

import { DragEvent, useEffect, useRef, useState } from "react";

import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Empty,
  Popconfirm,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";

import {
  SECTION_DRAG_TYPE,
  TSectionDrag,
} from "../../../components/store-site/shared/blocks/builder-types";
import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  IStoreSiteBlock,
  MAX_BLOCKS,
  isPartType,
} from "../../../shared/business/store-sites/store-site-blocks";
import {
  IStoreSitePage,
  sitePagesOf,
} from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import BlockFields from "./BlockFields";
import ImageLookCard from "./ImageLookCard";
import styles from "./BuilderTab.module.css";
import PieceFields from "./PieceFields";
import {
  ITabOwner,
  tabOwnersOf,
} from "../../../shared/business/store-sites/store-site-layout";
import { SECTION_ICONS } from "./section-icons";
import TabsFields from "./TabsFields";
import { ISiteBuilder } from "./useSiteBuilder";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

const T = StoreSitesEnum.BlockType;

/** The tab that edits what a part of the template shows. */
export const PART_TABS: Partial<Record<StoreSitesEnum.BlockType, string>> = {
  [T.HERO]: "hero",
  [T.MARQUEE]: "marquee",
  [T.CARDS]: "sections",
  [T.PRODUCTS]: "products",
  [T.ABOUT]: "about",
  [T.PAGE_BODY]: "pages",
};

/** Pieces edited with the block fields too: a heading, and items for some. */
// The pieces whose images follow the look of the builder's images.
const WITH_IMAGE_LOOK: StoreSitesEnum.BlockType[] = [
  StoreSitesEnum.BlockType.IMAGE,
  StoreSitesEnum.BlockType.BOX,
  StoreSitesEnum.BlockType.TEAM,
];

const WITH_BLOCK_FIELDS: StoreSitesEnum.BlockType[] = [
  ...StoreSitesEnum.CONTENT_BLOCK_TYPES,
  T.TEXT,
  T.IMAGE,
  T.BOX,
];

const HOME: string = "__home__";

interface Props {
  editor: IStoreSiteEditor;
  builder: ISiteBuilder;
  storeId: string;
  /** Opens the tab that edits a part's own content. */
  onOpenTab: (tab: string) => void;
}

/**
 * The page builder: which page, the pieces to drag onto the preview (or click
 * to add), the sections of the page in order, and the fields of the one
 * picked here or on the preview.
 */
const BuilderTab = ({ editor, builder, storeId, onOpenTab }: Props) => {
  const { t } = useLanguageData();
  const fieldsRef = useRef<HTMLDivElement>(null);

  // Dragging over the list of the page: the place a drop would land, counted
  // in its sections (0 is before the first), and the row being dragged.
  const [dropAt, setDropAt] = useState<number | null>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);

  const { setIsActive } = builder;

  // The preview frames sections only while this tab is open.
  useEffect(() => {
    setIsActive(true);

    return () => setIsActive(false);
  }, [setIsActive]);

  // A section picked on the preview: its fields come into view.
  useEffect(() => {
    if (builder.selectedKey) {
      fieldsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [builder.selectedKey]);

  if (!editor.draft) {
    return null;
  }

  const pages: IStoreSitePage[] = sitePagesOf(editor.draft.pages);
  const name = (type: StoreSitesEnum.BlockType): string =>
    t(`storeSite.editor.builder.types.${type}`);

  const total: number = editor.draft.blocks.length;

  // The sections a menu of tabs shows say so in the list, and lead back to it.
  const tabOwners: Map<string, ITabOwner> = tabOwnersOf(builder.sections);

  const selectedOwner: ITabOwner | undefined = builder.selected
    ? tabOwners.get(builder.selected.key)
    : undefined;

  /** Over the upper half of a row a drop lands before it; over the lower, after. */
  const overRow = (event: DragEvent<HTMLLIElement>, at: number): void => {
    if (!event.dataTransfer.types.includes(SECTION_DRAG_TYPE)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    const box: DOMRect = event.currentTarget.getBoundingClientRect();

    setDropAt(event.clientY < box.top + box.height / 2 ? at : at + 1);
  };

  /** A row of the list, or a piece of the palette, dropped on the list. */
  const dropOnList = (event: DragEvent<HTMLElement>): void => {
    const at: number | null = dropAt;

    event.preventDefault();
    setDropAt(null);
    setDraggingKey(null);

    if (at === null) {
      return;
    }

    let data: TSectionDrag | null = null;

    try {
      data = JSON.parse(event.dataTransfer.getData(SECTION_DRAG_TYPE));
    } catch {
      return;
    }

    if (data?.kind === "new") {
      builder.apply({ kind: "insert", type: data.type, atIndex: at });

      return;
    }

    if (data?.kind !== "move") {
      return;
    }

    const movedKey: string = data.key;

    const from: number = builder.sections.findIndex(
      (section: IStoreSiteBlock) => section.key === movedKey,
    );

    // Counted without the section being moved.
    const toIndex: number = from >= 0 && from < at ? at - 1 : at;

    if (from >= 0 && toIndex !== from) {
      builder.apply({ kind: "move", key: movedKey, toIndex });
    }
  };

  const tile = (type: StoreSitesEnum.BlockType) => {
    const isAllowed: boolean = builder.canAdd(type);

    return (
      <Tooltip
        key={type}
        title={
          isAllowed
            ? t(`storeSite.editor.builder.hints.${type}`)
            : t("storeSite.editor.builder.alreadyOnPage")
        }
        mouseEnterDelay={0.4}
      >
        <button
          type="button"
          className={styles.tile}
          disabled={!isAllowed}
          draggable={isAllowed}
          onDragStart={(event: DragEvent<HTMLButtonElement>) => {
            const data: TSectionDrag = { kind: "new", type };

            event.dataTransfer.setData(SECTION_DRAG_TYPE, JSON.stringify(data));
            event.dataTransfer.effectAllowed = "copy";
          }}
          onClick={() => builder.add(type)}
        >
          <span className={styles.tileIcon}>{SECTION_ICONS[type]}</span>
          <span className={styles.tileName}>{name(type)}</span>
        </button>
      </Tooltip>
    );
  };

  const group = (title: string, types: StoreSitesEnum.BlockType[]) => (
    <div className={styles.group}>
      <Typography.Text type="secondary" className={styles.groupTitle}>
        {title}
      </Typography.Text>
      <div className={styles.tiles}>{types.map(tile)}</div>
    </div>
  );

  const selected: IStoreSiteBlock | null = builder.selected;
  const index: number = builder.sections.findIndex(
    (section: IStoreSiteBlock) => section.key === selected?.key,
  );

  return (
    <div className={styles.builder}>
      <div className={styles.pageRow}>
        <Typography.Text strong>
          {t("storeSite.editor.builder.page")}
        </Typography.Text>
        <Select
          className={styles.pageSelect}
          value={builder.pageKey ?? HOME}
          onChange={(value: string) =>
            builder.setPageKey(value === HOME ? null : value)
          }
          options={[
            { value: HOME, label: t("storeSite.editor.blocks.home") },
            ...pages.map((page: IStoreSitePage) => ({
              value: page.key,
              label: page.label ?? t(`storeSite.pages.types.${page.type}`),
            })),
          ]}
        />
      </div>

      <Typography.Paragraph type="secondary" className={styles.hint}>
        {t("storeSite.editor.builder.hint")} ({total}/{MAX_BLOCKS})
      </Typography.Paragraph>

      {group(
        t("storeSite.editor.builder.groups.pieces"),
        StoreSitesEnum.PIECE_TYPES,
      )}
      {group(
        t("storeSite.editor.builder.groups.blocks"),
        StoreSitesEnum.CONTENT_BLOCK_TYPES,
      )}
      {group(
        t("storeSite.editor.builder.groups.parts"),
        StoreSitesEnum.PART_TYPES,
      )}

      <div className={styles.group}>
        <Typography.Text type="secondary" className={styles.groupTitle}>
          {t("storeSite.editor.builder.onThisPage")}
        </Typography.Text>
        {builder.sections.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t("storeSite.editor.builder.emptyPage")}
          />
        ) : (
          <ol
            className={styles.outline}
            onDragLeave={(event: DragEvent<HTMLOListElement>) => {
              // Out of the list altogether: no line.
              if (
                !event.currentTarget.contains(
                  event.relatedTarget as Node | null,
                )
              ) {
                setDropAt(null);
              }
            }}
            onDrop={dropOnList}
          >
            {builder.sections.map((section: IStoreSiteBlock, at: number) => (
              <li
                key={section.key}
                data-drop={
                  dropAt === at
                    ? "before"
                    : dropAt === at + 1 && at === builder.sections.length - 1
                      ? "after"
                      : undefined
                }
                data-dragging={section.key === draggingKey || undefined}
                onDragOver={(event: DragEvent<HTMLLIElement>) =>
                  overRow(event, at)
                }
              >
                <button
                  type="button"
                  className={styles.row}
                  data-selected={
                    section.key === builder.selectedKey || undefined
                  }
                  data-hidden={!section.isActive || undefined}
                  draggable
                  onDragStart={(event: DragEvent<HTMLButtonElement>) => {
                    const data: TSectionDrag = {
                      kind: "move",
                      key: section.key,
                    };

                    event.dataTransfer.setData(
                      SECTION_DRAG_TYPE,
                      JSON.stringify(data),
                    );
                    event.dataTransfer.effectAllowed = "move";
                    setDraggingKey(section.key);
                  }}
                  onDragEnd={() => {
                    setDraggingKey(null);
                    setDropAt(null);
                  }}
                  onClick={() => builder.select(section.key)}
                >
                  <HolderOutlined className={styles.rowHandle} />
                  <span className={styles.rowIcon}>
                    {SECTION_ICONS[section.type]}
                  </span>
                  <span className={styles.rowName}>
                    {!isPartType(section.type) && section.title?.trim()
                      ? section.title
                      : name(section.type)}
                  </span>
                  {tabOwners.has(section.key) && (
                    <Tag className={styles.rowTag} color="blue">
                      {tabOwners.get(section.key)?.label ||
                        name(StoreSitesEnum.BlockType.TABS)}
                    </Tag>
                  )}
                  {!section.isActive && (
                    <Tag className={styles.rowTag}>
                      {t("storeSite.editor.builder.frame.hidden")}
                    </Tag>
                  )}
                  <span className={styles.rowIndex}>{at + 1}</span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div ref={fieldsRef}>
        {selected ? (
          <Card
            size="small"
            className={styles.selected}
            title={
              <Space size={8}>
                {SECTION_ICONS[selected.type]}
                {name(selected.type)}
              </Space>
            }
            extra={
              <Space size={0}>
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={index <= 0}
                  aria-label={t("storeSite.editor.moveUp")}
                  onClick={() =>
                    builder.apply({
                      kind: "move",
                      key: selected.key,
                      toIndex: index - 1,
                    })
                  }
                />
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={index >= builder.sections.length - 1}
                  aria-label={t("storeSite.editor.moveDown")}
                  onClick={() =>
                    builder.apply({
                      kind: "move",
                      key: selected.key,
                      toIndex: index + 1,
                    })
                  }
                />
                {!isPartType(selected.type) && (
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    aria-label={t("storeSite.editor.builder.frame.duplicate")}
                    onClick={() =>
                      builder.apply({ kind: "duplicate", key: selected.key })
                    }
                  />
                )}
                <Button
                  type="text"
                  size="small"
                  icon={
                    selected.isActive ? (
                      <EyeOutlined />
                    ) : (
                      <EyeInvisibleOutlined />
                    )
                  }
                  aria-label={t(
                    selected.isActive
                      ? "storeSite.editor.builder.frame.hide"
                      : "storeSite.editor.builder.frame.show",
                  )}
                  onClick={() =>
                    builder.apply({ kind: "toggle", key: selected.key })
                  }
                />
                {selected.type !== T.HERO && (
                  <Popconfirm
                    title={t("storeSite.editor.builder.removeConfirm")}
                    okText={t("storeSite.editor.remove")}
                    okButtonProps={{ danger: true }}
                    onConfirm={() =>
                      builder.apply({ kind: "remove", key: selected.key })
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
                )}
              </Space>
            }
          >
            {selectedOwner && (
              <Button
                size="small"
                className="mb-3"
                icon={<ArrowLeftOutlined />}
                onClick={() => builder.select(selectedOwner.tabsKey)}
              >
                {t("storeSite.editor.builder.tabs.back").replace(
                  "{item}",
                  selectedOwner.label ||
                    t("storeSite.editor.builder.types.TABS"),
                )}
              </Button>
            )}
            {isPartType(selected.type) ? (
              <Space direction="vertical">
                <Typography.Text type="secondary">
                  {t(`storeSite.editor.builder.partNotes.${selected.type}`)}
                </Typography.Text>
                <Button
                  icon={<EditOutlined />}
                  onClick={() =>
                    onOpenTab(PART_TABS[selected.type] ?? "template")
                  }
                >
                  {t("storeSite.editor.builder.editPart")}
                </Button>
              </Space>
            ) : (
              <>
                {WITH_BLOCK_FIELDS.includes(selected.type) && (
                  <BlockFields
                    block={selected}
                    pages={pages}
                    storeId={storeId}
                    showItems={selected.type !== T.TEXT}
                    onChange={(change) =>
                      builder.updateSection(selected.key, change)
                    }
                  />
                )}
                {selected.type === T.TABS && (
                  <TabsFields section={selected} builder={builder} />
                )}
                <PieceFields
                  section={selected}
                  pages={pages}
                  storeId={storeId}
                  onChange={(change) =>
                    builder.updateSection(selected.key, change)
                  }
                />
                {WITH_IMAGE_LOOK.includes(selected.type) && (
                  <div className="mt-3">
                    <ImageLookCard editor={editor} place="block" />
                  </div>
                )}
              </>
            )}
          </Card>
        ) : (
          <Typography.Paragraph type="secondary" className={styles.hint}>
            {t("storeSite.editor.builder.pickHint")}
          </Typography.Paragraph>
        )}
      </div>
    </div>
  );
};

export default BuilderTab;
