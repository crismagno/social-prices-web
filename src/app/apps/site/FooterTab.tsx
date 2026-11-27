"use client";

import { useState } from "react";

import {
  Button,
  Dropdown,
  Empty,
  Form,
  Input,
  Select,
  Slider,
  Space,
  Switch,
  Tag,
} from "antd";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  DownOutlined,
  HolderOutlined,
  PlusOutlined,
  UpOutlined,
} from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  completeFooterUrl,
  FOOTER_IMAGE_HEIGHT_RANGE,
  isFooterContent,
  newFooterItem,
  IStoreSiteFooter,
  IStoreSiteFooterLink,
  IStoreSiteFooterSection,
} from "../../../shared/business/store-sites/store-site-footer";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import ImageField from "./ImageField";
import useDragReorder from "./useDragReorder";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
  storeId: string;
}

const F = StoreSitesEnum.FooterLinkType;

/** The kinds of item, as the lists show them: what is shown as it is, then the links. */
const KIND_GROUPS: { name: string; types: StoreSitesEnum.FooterLinkType[] }[] =
  [
    { name: "content", types: StoreSitesEnum.FOOTER_CONTENT_TYPES },
    {
      name: "links",
      types: Object.values(StoreSitesEnum.FooterLinkType).filter(
        (type: StoreSitesEnum.FooterLinkType) =>
          !StoreSitesEnum.FOOTER_CONTENT_TYPES.includes(type),
      ),
    },
  ];

/**
 * The foot of the site: a few words, the button into the app, and as many
 * links as the owner wants (social networks, other sites, ways to get in touch).
 */
const FooterTab = ({ editor, storeId }: Props) => {
  const { t } = useLanguageData();

  // Dragging a section by its handle: which one, and where it would land
  // (the place before which it goes; the last place is the end).
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);

  // The items open in the list; the others show one line each.
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());

  // An item dragged onto another takes its place, from the draft as it is then.
  const move = (from: number, to: number): void =>
    editor.update((draft) => {
      const links: IStoreSiteFooterLink[] = [...draft.footer.links];

      if (to < 0 || to >= links.length) {
        return {};
      }

      links.splice(to, 0, links.splice(from, 1)[0]);

      return { footer: { ...draft.footer, links } };
    });

  const drag = useDragReorder(move);

  if (!editor.draft) {
    return null;
  }

  const { footer } = editor.draft;

  // From the draft as it is when applied, like every other change of the editor.
  const set = (patch: Partial<IStoreSiteFooter>): void =>
    editor.update((draft) => ({ footer: { ...draft.footer, ...patch } }));

  const setLink = (key: string, patch: Partial<IStoreSiteFooterLink>): void =>
    editor.update((draft) => ({
      footer: {
        ...draft.footer,
        links: draft.footer.links.map((link: IStoreSiteFooterLink) =>
          link.key === key ? { ...link, ...patch } : link,
        ),
      },
    }));

  const add = (type: StoreSitesEnum.FooterLinkType): void => {
    const item: IStoreSiteFooterLink = newFooterItem(
      type,
      // Next to the last one added, which is where the next usually goes.
      footer.links[footer.links.length - 1]?.section ??
        footer.sections[footer.sections.length - 1].key,
    );

    set({ links: [...footer.links, item] });

    // A new one opens, to be filled in.
    setOpenKeys((current: Set<string>) => new Set(current).add(item.key));
  };

  const toggle = (key: string): void =>
    setOpenKeys((current: Set<string>) => {
      const next: Set<string> = new Set(current);

      if (!next.delete(key)) {
        next.add(key);
      }

      return next;
    });

  const sectionName = (
    section: IStoreSiteFooterSection,
    index: number,
  ): string =>
    section.title?.trim() ||
    `${t("storeSite.editor.footer.sections.section")} ${index + 1}`;

  const sectionOptions: { value: string; label: string }[] =
    footer.sections.map((section: IStoreSiteFooterSection, index: number) => ({
      value: section.key,
      label: sectionName(section, index),
    }));

  const setSection = (
    key: string,
    patch: Partial<IStoreSiteFooterSection>,
  ): void =>
    editor.update((draft) => ({
      footer: {
        ...draft.footer,
        sections: draft.footer.sections.map(
          (section: IStoreSiteFooterSection) =>
            section.key === key ? { ...section, ...patch } : section,
        ),
      },
    }));

  const addSection = (): void =>
    set({
      sections: [
        ...footer.sections,
        { key: `s-${Date.now().toString(36)}`, title: null },
      ],
    });

  // What was in a section that is removed moves to the first one that stays:
  // removing a column never removes what the owner put in it.
  const removeSection = (key: string): void =>
    editor.update((draft) => {
      const sections: IStoreSiteFooterSection[] = draft.footer.sections.filter(
        (section: IStoreSiteFooterSection) => section.key !== key,
      );

      const fallback: string = sections[0].key;

      const moved = (section: string): string =>
        section === key ? fallback : section;

      return {
        footer: {
          ...draft.footer,
          sections,
          links: draft.footer.links.map((link: IStoreSiteFooterLink) => ({
            ...link,
            section: moved(link.section),
          })),
        },
      };
    });

  const moveSection = (from: number, to: number): void => {
    if (to < 0 || to >= footer.sections.length) {
      return;
    }

    const sections: IStoreSiteFooterSection[] = [...footer.sections];

    sections.splice(to, 0, sections.splice(from, 1)[0]);

    set({ sections });
  };

  const endDrag = (): void => {
    setDragFrom(null);
    setDropAt(null);
  };

  const dropSection = (): void => {
    if (dragFrom !== null && dropAt !== null) {
      // Counted without the section being moved.
      const to: number = dropAt > dragFrom ? dropAt - 1 : dropAt;

      if (to !== dragFrom) {
        moveSection(dragFrom, to);
      }
    }

    endDrag();
  };

  const canAddSection: boolean =
    footer.sections.length < StoreSitesEnum.MAX_FOOTER_SECTIONS;

  const isFull: boolean =
    footer.links.length >= StoreSitesEnum.MAX_FOOTER_LINKS;

  return (
    <Form layout="vertical">
      <Form.Item label={t("storeSite.editor.footer.show")}>
        <Switch
          checked={footer.isActive}
          onChange={(isActive: boolean) => set({ isActive })}
        />
      </Form.Item>

      {footer.isActive && (
        <>
          <div className="font-medium mb-1">
            {t("storeSite.editor.footer.sections.heading")}
          </div>
          <p className="text-xs opacity-70 mb-2">
            {t("storeSite.editor.footer.sections.hint")}
          </p>
          <Space direction="vertical" className="w-full mb-5">
            {footer.sections.map(
              (section: IStoreSiteFooterSection, index: number) => (
                <div
                  key={section.key}
                  className="w-full rounded transition-opacity"
                  style={{
                    opacity: dragFrom === index ? 0.4 : 1,
                    // A line where the dragged section would land.
                    boxShadow:
                      dragFrom === null || dropAt === null
                        ? undefined
                        : dropAt === index
                          ? "0 -3px 0 0 #4f6bff"
                          : dropAt === index + 1 &&
                              index === footer.sections.length - 1
                            ? "0 3px 0 0 #4f6bff"
                            : undefined,
                  }}
                  onDragOver={(event) => {
                    if (dragFrom === null) {
                      return;
                    }

                    event.preventDefault();

                    const box: DOMRect =
                      event.currentTarget.getBoundingClientRect();

                    setDropAt(
                      event.clientY < box.top + box.height / 2
                        ? index
                        : index + 1,
                    );
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    dropSection();
                  }}
                >
                  <Space.Compact className="w-full">
                    <Button
                      icon={<HolderOutlined />}
                      className="cursor-grab"
                      draggable
                      title={t("storeSite.editor.footer.sections.drag")}
                      aria-label={t("storeSite.editor.footer.sections.drag")}
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", section.key);

                        // The whole row follows the pointer, not just the handle.
                        const row = event.currentTarget.closest("div");

                        if (row) {
                          event.dataTransfer.setDragImage(row, 16, 16);
                        }

                        setDragFrom(index);
                      }}
                      onDragEnd={endDrag}
                    />
                    <Input
                      maxLength={40}
                      addonBefore={index + 1}
                      placeholder={t(
                        "storeSite.editor.footer.sections.titlePlaceholder",
                      )}
                      value={section.title ?? ""}
                      onChange={(event) =>
                        setSection(section.key, {
                          title: event.target.value || null,
                        })
                      }
                    />
                    <Button
                      icon={<ArrowUpOutlined />}
                      disabled={index === 0}
                      aria-label={t("storeSite.editor.moveUp")}
                      onClick={() => moveSection(index, index - 1)}
                    />
                    <Button
                      icon={<ArrowDownOutlined />}
                      disabled={index === footer.sections.length - 1}
                      aria-label={t("storeSite.editor.moveDown")}
                      onClick={() => moveSection(index, index + 1)}
                    />
                    <Button
                      danger
                      type="primary"
                      icon={<DeleteOutlined />}
                      disabled={footer.sections.length <= 1}
                      aria-label={t("storeSite.editor.remove")}
                      onClick={() => removeSection(section.key)}
                    />
                  </Space.Compact>
                </div>
              ),
            )}
            <Button
              icon={<PlusOutlined />}
              disabled={!canAddSection}
              onClick={addSection}
            >
              {t("storeSite.editor.footer.sections.add")} (
              {footer.sections.length}/{StoreSitesEnum.MAX_FOOTER_SECTIONS})
            </Button>
          </Space>

          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-medium">
              {t("storeSite.editor.footer.linksHeading")}
            </span>
            {footer.links.length > 1 && (
              <Button
                type="link"
                size="small"
                className="px-0"
                onClick={() =>
                  setOpenKeys(
                    openKeys.size > 0
                      ? new Set()
                      : new Set(
                          footer.links.map(
                            (link: IStoreSiteFooterLink) => link.key,
                          ),
                        ),
                  )
                }
              >
                {t(
                  openKeys.size > 0
                    ? "storeSite.editor.footer.collapseAll"
                    : "storeSite.editor.footer.expandAll",
                )}
              </Button>
            )}
          </div>
          <p className="text-xs opacity-70 mb-2">
            {t("storeSite.editor.footer.itemsHint")}
          </p>

          <Space direction="vertical" className="w-full">
            {footer.links.length === 0 && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("storeSite.editor.footer.empty")}
              />
            )}

            {footer.links.map((link: IStoreSiteFooterLink, index: number) => {
              const isContent: boolean = isFooterContent(link.type);
              const isOpen: boolean = openKeys.has(link.key);

              // Typed but not an address the site can link to.
              const isInvalid: boolean =
                !!link.url.trim() &&
                !completeFooterUrl(
                  isContent ? StoreSitesEnum.FooterLinkType.WEBSITE : link.type,
                  link.url,
                );

              // What the closed row says of it: its words, or where it leads.
              const summary: string =
                link.label?.trim() ||
                link.url.replace(/^(https?:\/\/|mailto:|tel:)/i, "");

              const sectionIndex: number = footer.sections.findIndex(
                (section: IStoreSiteFooterSection) =>
                  section.key === link.section,
              );

              return (
                <div
                  key={link.key}
                  className={`rounded-lg border ${
                    isInvalid
                      ? "border-red-400"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {/* The closed row: drag it to another place, click to open. */}
                  <div
                    className="flex items-center gap-2 px-2 py-1.5"
                    {...drag.itemProps(index)}
                  >
                    <HolderOutlined className="opacity-50 shrink-0" />
                    <button
                      type="button"
                      className="flex flex-1 min-w-0 items-center gap-2 text-left"
                      aria-expanded={isOpen}
                      onClick={() => toggle(link.key)}
                    >
                      {isOpen ? (
                        <UpOutlined className="text-xs opacity-60" />
                      ) : (
                        <DownOutlined className="text-xs opacity-60" />
                      )}
                      <span className="font-medium shrink-0">
                        {t(`storeSite.footer.types.${link.type}`)}
                      </span>
                      {summary && (
                        <span className="truncate text-xs opacity-60">
                          {summary}
                        </span>
                      )}
                    </button>
                    {footer.sections.length > 1 && sectionIndex >= 0 && (
                      <Tag className="m-0 shrink-0">
                        {sectionName(
                          footer.sections[sectionIndex],
                          sectionIndex,
                        )}
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
                      disabled={index === footer.links.length - 1}
                      aria-label={t("storeSite.editor.moveDown")}
                      onClick={() => move(index, index + 1)}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      aria-label={t("storeSite.editor.remove")}
                      onClick={() =>
                        set({
                          links: footer.links.filter(
                            (other: IStoreSiteFooterLink) =>
                              other.key !== link.key,
                          ),
                        })
                      }
                    />
                  </div>

                  {isOpen && (
                    <div className="px-3 pb-1 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Form.Item
                        label={t("storeSite.editor.footer.sections.linkIn")}
                      >
                        <Select
                          value={link.section}
                          options={sectionOptions}
                          onChange={(section: string) =>
                            setLink(link.key, { section })
                          }
                        />
                      </Form.Item>
                      <Form.Item label={t("storeSite.editor.footer.type")}>
                        <Select
                          value={link.type}
                          onChange={(type: StoreSitesEnum.FooterLinkType) =>
                            // Another kind: what the old one asked may not apply.
                            setLink(link.key, {
                              ...newFooterItem(type, link.section),
                              key: link.key,
                              label: link.label,
                              url: isFooterContent(type) ? "" : link.url,
                              imageUrl: link.imageUrl ?? null,
                            })
                          }
                          options={KIND_GROUPS.map((group) => ({
                            label: t(
                              `storeSite.editor.footer.kinds.${group.name}`,
                            ),
                            options: group.types.map(
                              (type: StoreSitesEnum.FooterLinkType) => ({
                                value: type,
                                label: t(`storeSite.footer.types.${type}`),
                              }),
                            ),
                          }))}
                        />
                      </Form.Item>

                      {(link.type === F.LOGO || link.type === F.IMAGE) && (
                        <>
                          <Form.Item
                            label={t("storeSite.editor.footer.image")}
                            extra={
                              link.type === F.LOGO
                                ? t("storeSite.editor.footer.logoImageHint")
                                : undefined
                            }
                          >
                            <ImageField
                              storeId={storeId}
                              value={link.imageUrl ?? null}
                              onChange={(imageUrl: string | null) =>
                                setLink(link.key, { imageUrl })
                              }
                            />
                          </Form.Item>
                          <Form.Item
                            label={t("storeSite.editor.footer.imageHeight")}
                          >
                            <Slider
                              min={FOOTER_IMAGE_HEIGHT_RANGE[0]}
                              max={FOOTER_IMAGE_HEIGHT_RANGE[1]}
                              value={link.height ?? 48}
                              tooltip={{
                                formatter: (value?: number) => `${value} px`,
                              }}
                              onChange={(height: number) =>
                                setLink(link.key, { height })
                              }
                            />
                          </Form.Item>
                        </>
                      )}

                      {link.type === F.NOTE && (
                        <Form.Item label={t("storeSite.editor.footer.text")}>
                          <Input.TextArea
                            rows={3}
                            maxLength={300}
                            value={link.label}
                            onChange={(event) =>
                              setLink(link.key, { label: event.target.value })
                            }
                          />
                        </Form.Item>
                      )}

                      {link.type === F.NAME && (
                        <Form.Item
                          label={t("storeSite.editor.footer.name")}
                          extra={t("storeSite.editor.footer.nameHint")}
                        >
                          <Input
                            maxLength={40}
                            allowClear
                            value={link.label}
                            onChange={(event) =>
                              setLink(link.key, { label: event.target.value })
                            }
                          />
                        </Form.Item>
                      )}

                      {link.type === F.SIGN_IN && (
                        <p className="text-xs opacity-70 mb-3">
                          {t("storeSite.editor.footer.loginHint")}
                        </p>
                      )}

                      {(!isContent || link.type === F.IMAGE) && (
                        <Form.Item
                          label={t(
                            link.type === F.IMAGE
                              ? "storeSite.editor.footer.imageUrl"
                              : "storeSite.editor.footer.url",
                          )}
                          validateStatus={isInvalid ? "error" : undefined}
                          help={
                            isInvalid
                              ? t("storeSite.editor.footer.invalidUrl")
                              : undefined
                          }
                        >
                          <Input
                            maxLength={300}
                            allowClear={link.type === F.IMAGE}
                            placeholder={
                              isContent
                                ? "https://"
                                : t(
                                    `storeSite.editor.footer.placeholders.${link.type}`,
                                  )
                            }
                            value={link.url}
                            onChange={(event) =>
                              setLink(link.key, { url: event.target.value })
                            }
                            // Leaving the field completes it ("https://", a call, a chat),
                            // so the preview already shows the link as it will be.
                            onBlur={() => {
                              const completed: string | null =
                                completeFooterUrl(
                                  isContent
                                    ? StoreSitesEnum.FooterLinkType.WEBSITE
                                    : link.type,
                                  link.url,
                                );

                              if (completed && completed !== link.url) {
                                setLink(link.key, { url: completed });
                              }
                            }}
                          />
                        </Form.Item>
                      )}

                      {(!isContent || link.type === F.IMAGE) && (
                        <Form.Item
                          label={t(
                            link.type === F.IMAGE
                              ? "storeSite.editor.footer.imageAlt"
                              : "storeSite.editor.footer.label",
                          )}
                          extra={
                            link.type === F.IMAGE
                              ? undefined
                              : t("storeSite.editor.footer.labelHint")
                          }
                        >
                          <Input
                            maxLength={40}
                            value={link.label}
                            onChange={(event) =>
                              setLink(link.key, { label: event.target.value })
                            }
                          />
                        </Form.Item>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <Dropdown
              disabled={isFull}
              trigger={["click"]}
              menu={{
                items: KIND_GROUPS.map((group) => ({
                  type: "group" as const,
                  key: group.name,
                  label: t(`storeSite.editor.footer.kinds.${group.name}`),
                  children: group.types.map(
                    (type: StoreSitesEnum.FooterLinkType) => ({
                      key: type,
                      label: t(`storeSite.footer.types.${type}`),
                    }),
                  ),
                })),
                onClick: ({ key }) => add(key as StoreSitesEnum.FooterLinkType),
              }}
            >
              <Button icon={<PlusOutlined />} disabled={isFull}>
                {t("storeSite.editor.footer.add")} ({footer.links.length}/
                {StoreSitesEnum.MAX_FOOTER_LINKS}) <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        </>
      )}
    </Form>
  );
};

export default FooterTab;
