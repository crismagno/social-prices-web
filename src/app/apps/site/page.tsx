"use client";

import { useEffect, useMemo, useState } from "react";

import { Empty, Spin } from "antd";
import { useSearchParams } from "next/navigation";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { IPreviewData } from "../../../components/store-site/preview-channel";
import Layout from "../../../components/template/Layout/Layout";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IProduct } from "../../../shared/business/products/products.interface";
import { IPublicSiteProduct } from "../../../shared/business/store-sites/store-sites.types";
import { IStore } from "../../../shared/business/stores/stores.interface";
import EditorPanel from "./EditorPanel";
import SitePreview from "./SitePreview";
import useSiteBuilder from "./useSiteBuilder";
import useStoreSiteEditor from "./useStoreSiteEditor";

/** Where the owner builds the public site of a store. */
export default function AppSitePage() {
  const { t } = useLanguageData();

  // The store asked for by who linked here (the store profile).
  const askedStoreId: string | null = useSearchParams().get("store");

  const [stores, setStores] = useState<IStore[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState<boolean>(true);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const found: IStore[] =
          await serviceMethodsInstance.storesServiceMethods.findByUser();

        setStores(found);
        const asked: IStore | undefined = found.find(
          (candidate: IStore) => candidate._id === askedStoreId,
        );

        setStoreId(
          (current: string | null) =>
            current ?? asked?._id ?? found[0]?._id ?? null,
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

  const builder = useSiteBuilder(editor);

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
      page: builder.page,
      // Sections are framed and can be dropped only while the builder is open.
      builder: builder.isActive ? { selectedKey: builder.selectedKey } : null,
    };
  }, [
    editor.draft,
    editor.storeProducts,
    store,
    builder.page,
    builder.isActive,
    builder.selectedKey,
  ]);

  const [isSideBySide, setIsSideBySide] = useState<boolean>(false);

  useEffect(() => {
    // Same breakpoint as the two columns (Tailwind's lg).
    const query: MediaQueryList = window.matchMedia("(min-width: 1024px)");

    const sync = (): void => setIsSideBySide(query.matches);

    sync();
    query.addEventListener("change", sync);

    return () => query.removeEventListener("change", sync);
  }, []);

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
        <>
          {editor.isLoading || !editor.draft ? (
            <Spin />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)] gap-4">
              <EditorPanel
                editor={editor}
                stores={stores}
                storeId={storeId}
                onStoreChange={setStoreId}
                isSideBySide={isSideBySide}
                builder={builder}
              />
              {preview && (
                <SitePreview data={preview} onBuilderAction={builder.apply} />
              )}
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
