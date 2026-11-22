"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import handleClientError from "../../../components/common/HandleClientError/HandleClientError";
import { getTemplateEntry } from "../../../components/store-site/template-registry";
import { serviceMethodsInstance } from "../../../services/social-prices-api/service-methods";
import { IProduct } from "../../../shared/business/products/products.interface";
import {
  ISaveStoreSite,
  IStoreSite,
} from "../../../shared/business/store-sites/store-site.interface";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { IStore } from "../../../shared/business/stores/stores.interface";

export type TDraftPatch =
  | Partial<ISaveStoreSite>
  | ((draft: ISaveStoreSite) => Partial<ISaveStoreSite>);

export interface IStoreSiteEditor {
  draft: ISaveStoreSite | null;
  saved: IStoreSite | null;
  /** The store's own products that can be put on the site. */
  storeProducts: IProduct[];
  /** There is something to save: changes, or a site never saved. */
  hasUnsaved: boolean;
  /** Changes made since it was loaded or saved. */
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  slugError: string | null;
  /**
   * Changes the draft. Pass a function when the change is computed from the
   * draft and may be applied later (an upload that just finished): it then sees
   * the draft as it is at that moment, not as it was when the upload began.
   */
  update: (patch: TDraftPatch) => void;
  changeTemplate: (
    templateId: StoreSitesEnum.Template,
    useDefaultColors: boolean,
  ) => void;
  save: () => Promise<boolean>;
  publish: () => Promise<void>;
  unpublish: () => Promise<void>;
}

export const slugify = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");

const toDraft = (site: IStoreSite): ISaveStoreSite => ({
  slug: site.slug,
  templateId: site.templateId,
  theme: { ...site.theme },
  hero: { ...site.hero },
  sections: site.sections.map((section) => ({ ...section })),
  marquee: { isActive: site.marquee.isActive, items: [...site.marquee.items] },
  productIds: site.productIds.map(String),
});

const newDraft = (store: IStore): ISaveStoreSite => ({
  slug: slugify(store.name) || "minha-loja",
  templateId: StoreSitesEnum.Template.ATELIER,
  theme: { ...getTemplateEntry(StoreSitesEnum.Template.ATELIER).defaultTheme },
  hero: {
    tagline: null,
    title: store.name,
    subtitle: store.description ?? null,
    backgroundImageUrl: null,
    featuredImageUrl: null,
    ctaLabel: null,
  },
  sections: [],
  marquee: { isActive: false, items: [] },
  productIds: [],
});

/** Loads, edits and saves the site of one store. */
const useStoreSiteEditor = (store: IStore | null): IStoreSiteEditor => {
  const [saved, setSaved] = useState<IStoreSite | null>(null);
  const [draft, setDraft] = useState<ISaveStoreSite | null>(null);
  const [baseline, setBaseline] = useState<string>("");
  const [storeProducts, setStoreProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  const storeId: string | null = store?._id ?? null;

  useEffect(() => {
    // Nothing of the store shown before may stay on screen under the new one.
    setDraft(null);
    setSaved(null);
    setStoreProducts([]);
    setSlugError(null);

    if (!store || !storeId) {
      return;
    }

    let isCurrent: boolean = true;

    const load = async (): Promise<void> => {
      try {
        setIsLoading(true);

        const [site, products] = await Promise.all([
          serviceMethodsInstance.storeSitesServiceMethods.findByStoreId(
            storeId,
          ),
          serviceMethodsInstance.productsServiceMethods.findByUser(),
        ]);

        if (!isCurrent) {
          return;
        }

        const initial: ISaveStoreSite = site ? toDraft(site) : newDraft(store);

        setSaved(site);
        setDraft(initial);
        setBaseline(JSON.stringify(initial));
        setSlugError(null);
        setStoreProducts(
          products.filter(
            (product: IProduct) =>
              product.isActive && (product.storeIds ?? []).includes(storeId),
          ),
        );
      } catch (error: any) {
        handleClientError(error);
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isCurrent = false;
    };
    // Reloads only when another store is chosen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const update = useCallback((patch: TDraftPatch) => {
    setDraft((current: ISaveStoreSite | null) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        ...(typeof patch === "function" ? patch(current) : patch),
      };
    });

    if (typeof patch !== "function" && patch.slug !== undefined) {
      setSlugError(null);
    }
  }, []);

  const changeTemplate = useCallback(
    (templateId: StoreSitesEnum.Template, useDefaultColors: boolean) =>
      setDraft((current: ISaveStoreSite | null) =>
        current
          ? {
              ...current,
              templateId,
              // The content is never touched: only how it is drawn.
              theme: useDefaultColors
                ? { ...getTemplateEntry(templateId).defaultTheme }
                : current.theme,
            }
          : current,
      ),
    [],
  );

  const save = useCallback(async (): Promise<boolean> => {
    if (!storeId || !draft) {
      return false;
    }

    const sellableIds: Set<string> = new Set(
      storeProducts.map((product: IProduct) => product._id),
    );

    // A product switched off or moved since it was chosen would be refused:
    // it is dropped here instead of blocking every save.
    const sent: ISaveStoreSite = {
      ...draft,
      slug: draft.slug.trim().toLowerCase(),
      productIds: draft.productIds.filter((productId: string) =>
        sellableIds.has(productId),
      ),
    };

    const draftWhenSent: string = JSON.stringify(draft);

    try {
      setIsSaving(true);

      const site: IStoreSite =
        await serviceMethodsInstance.storeSitesServiceMethods.save(
          storeId,
          sent,
        );

      const stored: ISaveStoreSite = toDraft(site);

      setSaved(site);
      setBaseline(JSON.stringify(stored));
      setSlugError(null);
      // What was typed while it was saving is kept, and stays "not saved".
      setDraft((current: ISaveStoreSite | null) =>
        current && JSON.stringify(current) !== draftWhenSent ? current : stored,
      );

      return true;
    } catch (error: any) {
      const body: any = error?.response?.data?.error ?? error?.response?.data;

      if (body?.code === StoreSitesEnum.ErrorCodes.SLUG_TAKEN) {
        setSlugError(StoreSitesEnum.ErrorCodes.SLUG_TAKEN);
      } else {
        handleClientError(error);
      }

      return false;
    } finally {
      setIsSaving(false);
    }
  }, [storeId, draft, storeProducts]);

  const setPublished = useCallback(
    async (isPublished: boolean): Promise<void> => {
      if (!storeId) {
        return;
      }

      try {
        setIsSaving(true);

        const methods = serviceMethodsInstance.storeSitesServiceMethods;

        setSaved(
          isPublished
            ? await methods.publish(storeId)
            : await methods.unpublish(storeId),
        );
      } catch (error: any) {
        handleClientError(error);
      } finally {
        setIsSaving(false);
      }
    },
    [storeId],
  );

  const isDirty: boolean = useMemo(
    () => !!draft && JSON.stringify(draft) !== baseline,
    [draft, baseline],
  );

  return {
    draft,
    saved,
    storeProducts,
    hasUnsaved: isDirty || (!!draft && !saved && !isLoading),
    isDirty,
    isLoading,
    isSaving,
    slugError,
    update,
    changeTemplate,
    save,
    publish: useCallback(() => setPublished(true), [setPublished]),
    unpublish: useCallback(() => setPublished(false), [setPublished]),
  };
};

export default useStoreSiteEditor;
