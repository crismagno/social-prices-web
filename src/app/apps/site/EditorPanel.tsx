"use client";

import { ReactNode, useState } from "react";

import { Alert, App, Badge, Button, Card, Select, Tag, Tooltip } from "antd";

import {
  AppstoreAddOutlined,
  AppstoreOutlined,
  BgColorsOutlined,
  BorderBottomOutlined,
  BorderTopOutlined,
  CheckCircleFilled,
  CommentOutlined,
  ExportOutlined,
  FileTextOutlined,
  LinkOutlined,
  PictureOutlined,
  SaveOutlined,
  SnippetsOutlined,
  UndoOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

import useLanguageData from "../../../data/context/language/useLanguageData";
import { invalidPageKeys } from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { IStore } from "../../../shared/business/stores/stores.interface";
import Urls from "../../../shared/common/routes-app/routes-app";
import { ProductsTab, PublishTab } from "./CatalogPublishTabs";
import { HeroTab } from "./ContentTabs";
import { ColorsTab, TemplateTab } from "./DesignTabs";
import BuilderTab from "./BuilderTab";
import CartTab from "./CartTab";
import ChatTab from "./ChatTab";
import FooterTab from "./FooterTab";
import HeaderTab from "./HeaderTab";
import MocksTab from "./MocksTab";
import PagesTab from "./PagesTab";
import useAvailableHeight from "./useAvailableHeight";
import { ISiteBuilder } from "./useSiteBuilder";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

type TTab =
  | "builder"
  | "template"
  | "colors"
  | "header"
  | "hero"
  | "products"
  | "cart"
  | "pages"
  | "chat"
  | "footer"
  | "publish"
  | "mocks";

interface Props {
  editor: IStoreSiteEditor;
  stores: IStore[];
  storeId: string;
  onStoreChange: (storeId: string) => void;
  /** Side by side with the preview: the panel is as tall as the window allows. */
  isSideBySide: boolean;
  /** The page builder, shared with the preview. */
  builder: ISiteBuilder;
}

const TABS: { key: TTab; icon: ReactNode }[] = [
  { key: "builder", icon: <AppstoreAddOutlined /> },
  { key: "template", icon: <AppstoreOutlined /> },
  { key: "colors", icon: <BgColorsOutlined /> },
  { key: "header", icon: <BorderTopOutlined /> },
  { key: "hero", icon: <PictureOutlined /> },
  { key: "products", icon: <ShoppingOutlined /> },
  { key: "cart", icon: <ShoppingCartOutlined /> },
  { key: "pages", icon: <FileTextOutlined /> },
  { key: "chat", icon: <CommentOutlined /> },
  { key: "footer", icon: <BorderBottomOutlined /> },
  { key: "publish", icon: <LinkOutlined /> },
  { key: "mocks", icon: <SnippetsOutlined /> },
];

/**
 * Everything the owner controls, in one card: which store and its state at the
 * top, the sections of the editor, the fields of the one open (the only part
 * that scrolls), and saving always within reach at the bottom.
 */
const EditorPanel = ({
  editor,
  stores,
  storeId,
  onStoreChange,
  isSideBySide,
  builder,
}: Props) => {
  const { t } = useLanguageData();
  const { modal } = App.useApp();

  // Asked first, and said plainly: it throws away what the owner wrote.
  const confirmReset = (): void => {
    modal.confirm({
      title: t("storeSite.editor.reset.title"),
      content: (
        <div className="text-sm">
          <p className="mb-2">{t("storeSite.editor.reset.lost")}</p>
          <p className="mb-2">{t("storeSite.editor.reset.kept")}</p>
          <p className="mb-0 opacity-70">
            {t("storeSite.editor.reset.notSaved")}
          </p>
        </div>
      ),
      okText: t("storeSite.editor.reset.confirm"),
      okButtonProps: { danger: true },
      cancelText: t("storeSite.editor.cancel"),
      // Enter and the highlighted button keep things as they are.
      autoFocusButton: "cancel",
      onOk: () => editor.resetToDefaults(),
    });
  };

  const [tab, setTab] = useState<TTab>("builder");

  const { ref, height } = useAvailableHeight<HTMLDivElement>(420);

  const { draft, saved } = editor;

  if (!draft) {
    return null;
  }

  const currentStore: IStore | undefined = stores.find(
    (store: IStore) => store._id === storeId,
  );

  const isSlugValid: boolean = StoreSitesEnum.SLUG_REGEX.test(draft.slug);

  // Which section is holding the save back, so its tab can say so.
  const problems: Record<TTab, boolean> = {
    template: false,
    colors: false,
    header: false,
    hero: !draft.hero.title.trim(),
    products: false,
    cart: false,
    builder: false,
    pages: invalidPageKeys(draft.pages).length > 0,
    chat: false,
    footer: false,
    publish: !isSlugValid || !!editor.slugError,
    mocks: false,
  };

  const firstProblem: TTab | undefined = TABS.find(
    ({ key }: { key: TTab }) => problems[key],
  )?.key;

  const canSave: boolean = !firstProblem;

  const siteUrl: string | null =
    saved?.isPublished && typeof window !== "undefined"
      ? `${window.location.origin}${Urls.SITE.replace(":slug", saved.slug)}`
      : null;

  const content: Record<TTab, ReactNode> = {
    builder: (
      <BuilderTab
        editor={editor}
        builder={builder}
        storeId={storeId}
        onOpenTab={(next: string) => setTab(next as TTab)}
        storeAbout={currentStore?.about ?? null}
      />
    ),
    template: <TemplateTab editor={editor} />,
    colors: <ColorsTab editor={editor} />,
    header: (
      <HeaderTab
        editor={editor}
        storeId={storeId}
        storeName={currentStore?.name ?? ""}
      />
    ),
    hero: <HeroTab editor={editor} storeId={storeId} />,
    products: <ProductsTab editor={editor} />,
    cart: <CartTab editor={editor} />,
    pages: <PagesTab editor={editor} storeId={storeId} />,
    chat: <ChatTab editor={editor} />,
    footer: <FooterTab editor={editor} storeId={storeId} />,
    publish: <PublishTab editor={editor} storeId={storeId} />,
    mocks: <MocksTab editor={editor} storeId={storeId} />,
  };

  return (
    <Card
      ref={ref}
      className="min-w-0 overflow-hidden"
      style={isSideBySide ? { height } : undefined}
      styles={{
        body: {
          padding: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Which store, and where its site stands. */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wide opacity-60">
              {t("storeSite.editor.panel.store")}
            </div>
            {stores.length > 1 ? (
              <Tooltip
                title={
                  editor.isDirty
                    ? t("storeSite.editor.panel.saveBeforeSwitching")
                    : undefined
                }
              >
                <Select
                  variant="borderless"
                  className="-ml-3 font-semibold"
                  popupMatchSelectWidth={false}
                  value={storeId}
                  disabled={editor.isDirty}
                  onChange={onStoreChange}
                  options={stores.map((store: IStore) => ({
                    value: store._id,
                    label: store.name,
                  }))}
                />
              </Tooltip>
            ) : (
              <div className="font-semibold truncate">{currentStore?.name}</div>
            )}
          </div>
          <Tag
            className="m-0 shrink-0"
            color={saved?.isPublished ? "green" : saved ? "default" : "blue"}
          >
            {saved?.isPublished
              ? t("storeSite.editor.publish.online")
              : saved
                ? t("storeSite.editor.publish.offline")
                : t("storeSite.editor.panel.notCreated")}
          </Tag>
        </div>
        {siteUrl && (
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 max-w-full"
          >
            <span className="truncate">
              {siteUrl.replace(/^https?:\/\//, "")}
            </span>
            <ExportOutlined />
          </a>
        )}
      </div>

      {/* The sections of the editor. A dot marks the one that needs attention. */}
      <div
        role="tablist"
        aria-label={t("storeSite.editor.title")}
        className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700"
      >
        {TABS.map(({ key, icon }: { key: TTab; icon: ReactNode }) => {
          const isActive: boolean = key === tab;

          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`site-editor-${key}`}
              title={t(`storeSite.editor.tabs.${key}`)}
              onClick={() => setTab(key)}
              className={`flex-1 min-w-[58px] flex flex-col items-center gap-1 py-2.5 px-0.5 text-[11px] leading-none border-b-2 transition-colors ${
                isActive
                  ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
                  : "border-transparent opacity-70 hover:opacity-100 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Badge dot={problems[key]} offset={[4, -2]}>
                <span className="text-base text-current">{icon}</span>
              </Badge>
              <span className="truncate max-w-full">
                {t(`storeSite.editor.tabs.${key}`)}
              </span>
            </button>
          );
        })}
      </div>

      {/* The fields of the open section: the only part that scrolls. */}
      <div
        id={`site-editor-${tab}`}
        role="tabpanel"
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4"
      >
        <p className="text-xs opacity-70 mb-4">
          {t(`storeSite.editor.hints.${tab}`)}
        </p>
        {content[tab]}
      </div>

      {/* Saving, always within reach. */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        {/* A mock was opened over what the editor had: the way back stays in
            sight, whatever tab is open, until the owner keeps the mock. */}
        {editor.openedMockName && (
          <Alert
            className="mb-3"
            type="info"
            showIcon
            message={t("storeSite.editor.mocks.openedBanner").replace(
              "{name}",
              editor.openedMockName,
            )}
            action={
              <div className="flex flex-col gap-1">
                <Button
                  size="small"
                  icon={<UndoOutlined />}
                  onClick={editor.undoOpenContent}
                >
                  {t("storeSite.editor.mocks.undo")}
                </Button>
                <Button
                  size="small"
                  type="text"
                  onClick={editor.keepOpenContent}
                >
                  {t("storeSite.editor.mocks.keep")}
                </Button>
              </div>
            }
          />
        )}
        {firstProblem && (
          <Alert
            className="mb-3"
            type="warning"
            showIcon
            message={t(`storeSite.editor.problems.${firstProblem}`)}
            action={
              firstProblem !== tab ? (
                <Button
                  size="small"
                  type="link"
                  onClick={() => setTab(firstProblem)}
                >
                  {t("storeSite.editor.panel.goThere")}
                </Button>
              ) : undefined
            }
          />
        )}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs min-w-0 flex-1 truncate">
            {editor.hasUnsaved ? (
              <span className="text-orange-500">
                ● {t("storeSite.editor.unsaved")}
              </span>
            ) : (
              <span className="text-green-600">
                <CheckCircleFilled /> {t("storeSite.editor.panel.allSaved")}
              </span>
            )}
          </span>
          <Tooltip title={t("storeSite.editor.reset.button")}>
            <Button
              danger
              type="primary"
              icon={<UndoOutlined />}
              aria-label={t("storeSite.editor.reset.button")}
              disabled={editor.isSaving}
              onClick={confirmReset}
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={editor.isSaving}
            disabled={!editor.hasUnsaved || !canSave}
            onClick={editor.save}
          >
            {t("storeSite.editor.save")}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EditorPanel;
