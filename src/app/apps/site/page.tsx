"use client";

import { useEffect, useMemo, useState } from "react";

import { Alert, Button, Empty, Select, Space, Spin, Tabs, Tag } from "antd";

import { SaveOutlined } from "@ant-design/icons";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { IPreviewData } from "../../../components/store-site/preview-channel";
import Layout from "../../../components/template/Layout/Layout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IProduct } from "../../../shared/business/products/products.interface";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { IPublicSiteProduct } from "../../../shared/business/store-sites/store-sites.types";
import { IStore } from "../../../shared/business/stores/stores.interface";
import { HeroTab, MarqueeTab, SectionsTab } from "./ContentTabs";
import { ProductsTab, PublishTab } from "./CatalogPublishTabs";
import { ColorsTab, TemplateTab } from "./DesignTabs";
import SitePreview from "./SitePreview";
import useStoreSiteEditor from "./useStoreSiteEditor";

/** Where the owner builds the public site of a store. */
export default function AppSitePage() {
  const { t } = useLanguageData();

  const [stores, setStores] = useState<IStore[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState<boolean>(true);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const found: IStore[] =
          await serviceMethodsInstance.storesServiceMethods.findByUser();

        setStores(found);
        setStoreId(
          (current: string | null) => current ?? found[0]?._id ?? null,
        );
      } catch (error: any) {
        handleClientError(error);
      } finally {
        setIsLoadingStores(false);
      }
    };

    load();
  }, []);

  const store: IStore | null = useMemo(
    () => stores.find((candidate: IStore) => candidate._id === storeId) ?? null,
    [stores, storeId],
  );

  const editor = useStoreSiteEditor(store);

  const { isDirty } = editor;

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    // Leaving with changes not saved asks first.
    const warn = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warn);

    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const preview: IPreviewData | null = useMemo(() => {
    if (!editor.draft || !store) {
      return null;
    }

    const productById: Map<string, IProduct> = new Map(
      editor.storeProducts.map((product: IProduct) => [product._id, product]),
    );

    // An approximation for the editor: the public page prices by the default item.
    const products: IPublicSiteProduct[] = editor.draft.productIds.reduce(
      (list: IPublicSiteProduct[], productId: string) => {
        const product: IProduct | undefined = productById.get(productId);

        if (product) {
          list.push({
            _id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            mainUrl: product.mainUrl,
            filesUrl: product.filesUrl ?? [],
            isAvailable: product.quantity > 0,
          });
        }

        return list;
      },
      [],
    );

    return {
      site: editor.draft,
      store: {
        name: store.name,
        logo: store.logo,
        description: store.description,
        about: store.about,
      },
      products,
    };
  }, [editor.draft, editor.storeProducts, store]);

  const isSlugValid: boolean =
    !!editor.draft && StoreSitesEnum.SLUG_REGEX.test(editor.draft.slug);

  const canSave: boolean =
    !!editor.draft &&
    isSlugValid &&
    !!editor.draft.hero.title.trim() &&
    editor.draft.sections.every((section) => section.title.trim());

  return (
    <Layout
      title={t("storeSite.editor.title")}
      subtitle={t("storeSite.editor.subtitle")}
    >
      {isLoadingStores ? (
        <Spin />
      ) : !store || !storeId ? (
        <Empty description={t("storeSite.editor.noStore")} />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Space wrap>
              {stores.length > 1 && (
                <Select
                  style={{ minWidth: 220 }}
                  value={storeId}
                  disabled={editor.isDirty}
                  onChange={setStoreId}
                  options={stores.map((candidate: IStore) => ({
                    value: candidate._id,
                    label: candidate.name,
                  }))}
                />
              )}
              {editor.saved && (
                <Tag color={editor.saved.isPublished ? "green" : "default"}>
                  {editor.saved.isPublished
                    ? t("storeSite.editor.publish.online")
                    : t("storeSite.editor.publish.offline")}
                </Tag>
              )}
              {editor.isDirty && (
                <Tag color="orange">{t("storeSite.editor.unsaved")}</Tag>
              )}
            </Space>
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

          {editor.draft && !isSlugValid && (
            <Alert
              type="warning"
              showIcon
              message={t("storeSite.editor.publish.slugInvalid")}
            />
          )}

          {editor.slugError && (
            <Alert
              type="error"
              showIcon
              message={t("storeSite.editor.publish.slugTaken")}
            />
          )}

          {editor.isLoading || !editor.draft ? (
            <Spin />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(340px,440px)_1fr] gap-4">
              <Tabs
                size="small"
                items={[
                  {
                    key: "template",
                    label: t("storeSite.editor.tabs.template"),
                    children: <TemplateTab editor={editor} />,
                  },
                  {
                    key: "colors",
                    label: t("storeSite.editor.tabs.colors"),
                    children: <ColorsTab editor={editor} />,
                  },
                  {
                    key: "hero",
                    label: t("storeSite.editor.tabs.hero"),
                    children: <HeroTab editor={editor} storeId={storeId} />,
                  },
                  {
                    key: "sections",
                    label: t("storeSite.editor.tabs.sections"),
                    children: <SectionsTab editor={editor} storeId={storeId} />,
                  },
                  {
                    key: "marquee",
                    label: t("storeSite.editor.tabs.marquee"),
                    children: <MarqueeTab editor={editor} />,
                  },
                  {
                    key: "products",
                    label: t("storeSite.editor.tabs.products"),
                    children: <ProductsTab editor={editor} />,
                  },
                  {
                    key: "publish",
                    label: t("storeSite.editor.tabs.publish"),
                    children: <PublishTab editor={editor} storeId={storeId} />,
                  },
                ]}
              />
              {preview && <SitePreview data={preview} />}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
