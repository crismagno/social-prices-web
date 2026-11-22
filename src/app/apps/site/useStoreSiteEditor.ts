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
import { siteFooterOf } from "../../../shared/business/store-sites/store-site-footer";
import { siteAboutOf } from "../../../shared/business/store-sites/store-site-about";
import { sitePagesOf } from "../../../shared/business/store-sites/store-site-pages";
import { siteSignInOf } from "../../../shared/business/store-sites/store-site-sign-in";
import {
  EMPTY_SITE_SIZES,
  siteSizesOf,
} from "../../../shared/business/store-sites/store-site-sizes";
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
  /**
   * Puts the draft back to how a new site starts, in the template it is in.
   * The address stays (links to the site keep working) and so does whether it
   * is online. Nothing is saved: the owner still has to save, or can reload.
   */
  resetToDefaults: () => void;
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
  displayName: site.displayName ?? null,
  // A site saved before the sizes existed has none set.
  sizes: siteSizesOf(site.sizes),
  // A site saved before the footer existed gets the default one.
  footer: siteFooterOf(site.footer),
  // A site saved before the button existed shows it, leading to the store.
  signIn: siteSignInOf(site.signIn),
  // A site saved before it existed shows the store's own description.
  about: siteAboutOf(site.about),
  // A site saved before pages existed gets the three ready ones.
  pages: sitePagesOf(site.pages),
  hero: { ...site.hero },
  sections: site.sections.map((section) => ({ ...section })),
  marquee: { isActive: site.marquee.isActive, items: [...site.marquee.items] },
  // A site saved before the logo was editable shows the logo of the store.
  logo: {
    isActive: site.logo?.isActive ?? true,
    imageUrl: site.logo?.imageUrl ?? null,
  },
  productIds: site.productIds.map(String),
});

const newDraft = (store: IStore): ISaveStoreSite => ({
  slug: slugify(store.name) || "minha-loja",
  templateId: StoreSitesEnum.Template.ATELIER,
  theme: { ...getTemplateEntry(StoreSitesEnum.Template.ATELIER).defaultTheme },
  displayName: null,
  sizes: { ...EMPTY_SITE_SIZES },
  footer: siteFooterOf(null),
  signIn: siteSignInOf(null),
  about: siteAboutOf(null),
  pages: sitePagesOf(null),
  hero: {
    tagline: null,
    title: store.name,
    subtitle: store.description ?? null,
    backgroundImageUrl: null,
    backgroundImageUrls: [],
    slideSeconds: StoreSitesEnum.DEFAULT_SLIDE_SECONDS,
    featuredImageUrl: null,
    featuredImageUrls: [],
    featuredSlideSeconds: StoreSitesEnum.DEFAULT_SLIDE_SECONDS,
    ctaLabel: null,
  },
  sections: [],
  marquee: { isActive: false, items: [] },
  logo: { isActive: true, imageUrl: null },
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

  const resetToDefaults = useCallback(() => {
    if (!store) {
      return;
    }

    setDraft((current: ISaveStoreSite | null) =>
      current
        ? {
            ...newDraft(store),
            slug: current.slug,
            templateId: current.templateId,
            theme: { ...getTemplateEntry(current.templateId).defaultTheme },
          }
        : current,
    );
    // Depends on the store itself: its name is the default title.
  }, [store]);

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
    resetToDefaults,
    changeTemplate,
    save,
    publish: useCallback(() => setPublished(true), [setPublished]),
    unpublish: useCallback(() => setPublished(false), [setPublished]),
  };
};

export default useStoreSiteEditor;
