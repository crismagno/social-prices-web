"use client";

import { useState } from "react";

import {
  Alert,
  Button,
  Card,
  ColorPicker,
  Form,
  Input,
  Space,
  Switch,
  Tag,
} from "antd";

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  DownOutlined,
  PlusOutlined,
  UpOutlined,
} from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  emptyPageContent,
  invalidPageKeys,
  missingReadyPages,
  newReadyPage,
  IStoreSiteFaqItem,
  IStoreSitePage,
  IStoreSitePageContent,
  slugifyPage,
} from "../../../shared/business/store-sites/store-site-pages";
import { siteBackdropOf } from "../../../shared/business/store-sites/store-site-backdrop";
import { IStoreSiteTheme } from "../../../shared/business/store-sites/store-site.interface";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import BackdropFields from "./BackdropFields";
import FeatureIconPicker from "./FeatureIconPicker";
import PageContentFields from "./PageContentFields";
import PageHeroFields from "./PageHeroFields";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
  storeId: string;
}

const COLOR_KEYS: (keyof IStoreSiteTheme)[] = [
  "primary",
  "secondary",
  "accent",
  "background",
  "text",
];

/**
 * The pages of the site besides its home, in the order of its menu: the ready
 * ones (products, about, support) and the owner's own.
 */
const PagesTab = ({ editor, storeId }: Props) => {
  const { t } = useLanguageData();

  const [openKey, setOpenKey] = useState<string | null>(null);

  if (!editor.draft) {
    return null;
  }

  const { pages } = editor.draft;

  const invalid: string[] = invalidPageKeys(pages);

  // Ready pages the owner removed, which can be added back.
  const missing: StoreSitesEnum.SitePageType[] = missingReadyPages(pages);

  const customCount: number = pages.filter(
    (page: IStoreSitePage) => page.type === StoreSitesEnum.SitePageType.CUSTOM,
  ).length;

  // From the draft as it is when applied, like every change of the editor.
  const setPage = (
    key: string,
    change: (page: IStoreSitePage) => Partial<IStoreSitePage>,
  ): void =>
    editor.update((draft) => ({
      pages: draft.pages.map((page: IStoreSitePage) =>
        page.key === key ? { ...page, ...change(page) } : page,
      ),
    }));

  const move = (from: number, to: number): void =>
    editor.update((draft) => {
      const next: IStoreSitePage[] = [...draft.pages];

      next.splice(to, 0, next.splice(from, 1)[0]);

      return { pages: next };
    });

  const addPage = (): void => {
    const key: string = `p-${Date.now().toString(36)}`;

    editor.update((draft) => ({
      pages: [
        ...draft.pages,
        {
          key,
          type: StoreSitesEnum.SitePageType.CUSTOM,
          slug: `pagina-${customCount + 1}`,
          label: t("storeSite.editor.pages.newPage"),
          isInMenu: true,
          icon: null,
          title: null,
          intro: null,
          content: emptyPageContent(),
          faq: [],
          hero: null,
          theme: null,
          backdrop: null,
        },
      ],
    }));

    setOpenKey(key);
  };

  const nameOf = (page: IStoreSitePage): string =>
    page.label?.trim() ||
    (page.type === StoreSitesEnum.SitePageType.CUSTOM
      ? page.slug
      : t(`storeSite.pages.types.${page.type}`));

  return (
    <Space direction="vertical" className="w-full">
      {pages.map((page: IStoreSitePage, index: number) => {
        const isOpen: boolean = openKey === page.key;
        const isCustom: boolean =
          page.type === StoreSitesEnum.SitePageType.CUSTOM;
        const isSupport: boolean =
          page.type === StoreSitesEnum.SitePageType.SUPPORT;
        const isContact: boolean =
          page.type === StoreSitesEnum.SitePageType.CONTACT;

        const setFaq = (
          change: (faq: IStoreSiteFaqItem[]) => IStoreSiteFaqItem[],
        ): void =>
          setPage(page.key, (current) => ({ faq: change([...current.faq]) }));

        return (
          <Card
            key={page.key}
            size="small"
            className={invalid.includes(page.key) ? "border-red-400" : ""}
            title={
              <button
                type="button"
                className="flex items-center gap-2 min-w-0 text-left w-full"
                aria-expanded={isOpen}
                onClick={() => setOpenKey(isOpen ? null : page.key)}
              >
                {isOpen ? <UpOutlined /> : <DownOutlined />}
                <span className="truncate">{nameOf(page)}</span>
                <Tag className="m-0 shrink-0">
                  {t(`storeSite.pages.types.${page.type}`)}
                </Tag>
              </button>
            }
            extra={
              <Space size={2}>
                <Switch
                  size="small"
                  checked={page.isInMenu}
                  aria-label={t("storeSite.editor.pages.inMenu")}
                  onChange={(isInMenu: boolean) =>
                    setPage(page.key, () => ({ isInMenu }))
                  }
                />
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
                  disabled={index === pages.length - 1}
                  aria-label={t("storeSite.editor.moveDown")}
                  onClick={() => move(index, index + 1)}
                />
                {
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={t("storeSite.editor.remove")}
                    onClick={() =>
                      editor.update((draft) => ({
                        pages: draft.pages.filter(
                          (other: IStoreSitePage) => other.key !== page.key,
                        ),
                      }))
                    }
                  />
                }
              </Space>
            }
          >
            {isOpen && (
              <Form layout="vertical">
                <Form.Item
                  label={t("storeSite.editor.pages.label")}
                  extra={t("storeSite.editor.pages.labelHint")}
                >
                  <Input
                    maxLength={30}
                    allowClear
                    placeholder={
                      isCustom
                        ? undefined
                        : t(`storeSite.pages.types.${page.type}`)
                    }
                    value={page.label ?? ""}
                    onChange={(event) =>
                      setPage(page.key, () => ({
                        label: event.target.value || null,
                      }))
                    }
                  />
                </Form.Item>

                <Form.Item
                  label={t("storeSite.editor.pages.icon")}
                  extra={t("storeSite.editor.pages.iconHint")}
                >
                  <FeatureIconPicker
                    value={page.icon}
                    onChange={(icon: StoreSitesEnum.FeatureIcon) =>
                      setPage(page.key, () => ({ icon }))
                    }
                    noneLabel={t("storeSite.editor.pages.iconNone")}
                    onClear={() => setPage(page.key, () => ({ icon: null }))}
                  />
                </Form.Item>

                {isCustom && (
                  <Form.Item
                    label={t("storeSite.editor.pages.slug")}
                    validateStatus={
                      invalid.includes(page.key) ? "error" : undefined
                    }
                    help={
                      invalid.includes(page.key)
                        ? t("storeSite.editor.pages.slugInvalid")
                        : undefined
                    }
                  >
                    <Input
                      addonBefore={`/site/${editor.draft?.slug ?? ""}/`}
                      maxLength={40}
                      value={page.slug}
                      onChange={(event) =>
                        setPage(page.key, () => ({
                          slug: event.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-"),
                        }))
                      }
                      onBlur={() =>
                        setPage(page.key, (current) => ({
                          slug: slugifyPage(current.slug),
                        }))
                      }
                    />
                  </Form.Item>
                )}

                <Form.Item
                  label={t("storeSite.editor.pages.title")}
                  extra={t("storeSite.editor.pages.titleHint")}
                >
                  <Input
                    maxLength={80}
                    allowClear
                    value={page.title ?? ""}
                    onChange={(event) =>
                      setPage(page.key, () => ({
                        title: event.target.value || null,
                      }))
                    }
                  />
                </Form.Item>
                <Form.Item label={t("storeSite.editor.pages.intro")}>
                  <Input.TextArea
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    maxLength={300}
                    value={page.intro ?? ""}
                    onChange={(event) =>
                      setPage(page.key, () => ({
                        intro: event.target.value || null,
                      }))
                    }
                  />
                </Form.Item>

                <PageHeroFields editor={editor} storeId={storeId} page={page} />

                {/* Its own colours: one left alone is the site's. */}
                <Form.Item
                  label={t("storeSite.editor.pages.colors")}
                  extra={t("storeSite.editor.pages.colorsHint")}
                >
                  <div className="flex flex-wrap gap-3">
                    {COLOR_KEYS.map((key: keyof IStoreSiteTheme) => (
                      <div key={key} className="flex flex-col gap-1">
                        <span className="text-xs opacity-70">
                          {t(`storeSite.editor.colors.${key}`)}
                        </span>
                        <ColorPicker
                          size="small"
                          disabledAlpha
                          allowClear
                          value={page.theme?.[key] ?? editor.draft?.theme[key]}
                          showText={() =>
                            page.theme?.[key]
                              ? page.theme[key]
                              : t("storeSite.editor.pages.colorOfSite")
                          }
                          onChangeComplete={(color) =>
                            setPage(page.key, (current) => ({
                              theme: {
                                ...(current.theme ?? {}),
                                [key]: color.toHexString().slice(0, 7),
                              },
                            }))
                          }
                          onClear={() =>
                            setPage(page.key, (current) => {
                              const rest: Partial<IStoreSiteTheme> = {
                                ...(current.theme ?? {}),
                              };

                              delete rest[key];

                              return {
                                theme: Object.keys(rest).length ? rest : null,
                              };
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </Form.Item>

                {/* Its own backdrop: without one, what lies behind the site. */}
                <Form.Item
                  className={page.backdrop ? "" : "mb-3"}
                  extra={t("storeSite.editor.backdrop.pageHint")}
                >
                  <label className="flex items-center justify-between gap-3">
                    <span>{t("storeSite.editor.backdrop.pageOwn")}</span>
                    <Switch
                      checked={!!page.backdrop}
                      onChange={(isOwn: boolean) =>
                        setPage(page.key, () => ({
                          // It starts from what lies behind the site.
                          backdrop: isOwn
                            ? siteBackdropOf(editor.draft?.backdrop)
                            : null,
                        }))
                      }
                    />
                  </label>
                </Form.Item>
                {page.backdrop && (
                  <BackdropFields
                    storeId={storeId}
                    backdrop={page.backdrop}
                    onChange={(change) =>
                      setPage(page.key, (current) => {
                        const own = siteBackdropOf(current.backdrop);

                        return { backdrop: { ...own, ...change(own) } };
                      })
                    }
                  />
                )}

                {page.type === StoreSitesEnum.SitePageType.PRODUCTS && (
                  <Alert
                    type="info"
                    showIcon
                    message={t("storeSite.editor.pages.productsHint")}
                  />
                )}
                {page.type === StoreSitesEnum.SitePageType.ABOUT && (
                  <Alert
                    type="info"
                    showIcon
                    message={t("storeSite.editor.pages.aboutHint")}
                  />
                )}

                {isContact && (
                  <Alert
                    className="mb-3"
                    type="info"
                    showIcon
                    message={t("storeSite.editor.pages.contactHint")}
                  />
                )}

                {(isCustom || isSupport || isContact) && (
                  <PageContentFields
                    storeId={storeId}
                    content={page.content}
                    update={(change) =>
                      setPage(page.key, (current) => ({
                        content: {
                          ...current.content,
                          ...change(current.content),
                        } as IStoreSitePageContent,
                      }))
                    }
                  />
                )}

                {isSupport && (
                  <>
                    <div className="font-medium mb-1">
                      {t("storeSite.editor.pages.faq")}
                    </div>
                    <p className="text-xs opacity-70 mb-2">
                      {t("storeSite.editor.pages.supportHint")}
                    </p>
                    <Space direction="vertical" className="w-full">
                      {page.faq.map((item: IStoreSiteFaqItem, at: number) => (
                        <Card
                          key={at}
                          size="small"
                          extra={
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              aria-label={t("storeSite.editor.remove")}
                              onClick={() =>
                                setFaq((faq) => faq.filter((_, i) => i !== at))
                              }
                            />
                          }
                          title={`${t("storeSite.editor.pages.question")} ${at + 1}`}
                        >
                          <Input
                            className="mb-2"
                            maxLength={200}
                            placeholder={t("storeSite.editor.pages.question")}
                            value={item.question}
                            onChange={(event) =>
                              setFaq((faq) => {
                                faq[at] = {
                                  ...faq[at],
                                  question: event.target.value,
                                };
                                return faq;
                              })
                            }
                          />
                          <Input.TextArea
                            autoSize={{ minRows: 2, maxRows: 6 }}
                            maxLength={1500}
                            placeholder={t("storeSite.editor.pages.answer")}
                            value={item.answer}
                            onChange={(event) =>
                              setFaq((faq) => {
                                faq[at] = {
                                  ...faq[at],
                                  answer: event.target.value,
                                };
                                return faq;
                              })
                            }
                          />
                        </Card>
                      ))}
                      <Button
                        icon={<PlusOutlined />}
                        disabled={
                          page.faq.length >= StoreSitesEnum.MAX_FAQ_ITEMS
                        }
                        onClick={() =>
                          setFaq((faq) => [
                            ...faq,
                            { question: "", answer: "" },
                          ])
                        }
                      >
                        {t("storeSite.editor.pages.addQuestion")} (
                        {page.faq.length}/{StoreSitesEnum.MAX_FAQ_ITEMS})
                      </Button>
                    </Space>
                  </>
                )}
              </Form>
            )}
          </Card>
        );
      })}

      {missing.length > 0 && (
        <Space wrap>
          {missing.map((type: StoreSitesEnum.SitePageType) => (
            <Button
              key={type}
              icon={<PlusOutlined />}
              onClick={() =>
                // Back at the end of the menu, as a new site has it.
                editor.update((draft) => ({
                  pages: [...draft.pages, newReadyPage(type)],
                }))
              }
            >
              {t(`storeSite.pages.types.${type}`)}
            </Button>
          ))}
        </Space>
      )}

      <Button
        icon={<PlusOutlined />}
        disabled={pages.length >= StoreSitesEnum.MAX_PAGES}
        onClick={addPage}
      >
        {t("storeSite.editor.pages.add")} ({pages.length}/
        {StoreSitesEnum.MAX_PAGES})
      </Button>
    </Space>
  );
};

export default PagesTab;
