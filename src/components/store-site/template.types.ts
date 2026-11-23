import { ComponentType } from "react";

import { IStoreSitePage } from "../../shared/business/store-sites/store-site-pages";
import { IStoreSiteTheme } from "../../shared/business/store-sites/store-site.interface";
import {
  IPublicSiteProduct,
  IPublicSiteStore,
  TPublicSite,
} from "../../shared/business/store-sites/store-sites.types";

/** What a template may do with the cart: the drawer itself is shared. */
export interface ISiteCartApi {
  count: number;
  quantityOf: (productId: string) => number;
  add: (productId: string) => void;
  open: () => void;
}

/**
 * Every template receives the same content and draws it its own way.
 * "preview" is the editor: nothing navigates and nothing is ordered.
 */
export interface IStoreSiteTemplateProps {
  site: Pick<
    TPublicSite,
    | "slug"
    | "templateId"
    | "theme"
    | "displayName"
    | "sizes"
    | "footer"
    | "signIn"
    | "about"
    | "pages"
    | "blocks"
    | "hero"
    | "sections"
    | "marquee"
    | "logo"
  > & {
    /** Only on the published site: the editor's draft has no store yet. */
    storeId?: string;
  };
  store: IPublicSiteStore;
  products: IPublicSiteProduct[];
  mode: "live" | "preview";
  cart: ISiteCartApi;
  /** The page shown; none is the home, which shows everything. */
  page?: IStoreSitePage | null;
  /** Opens the details of a product. Absent in the editor, where nothing opens. */
  onProductOpen?: (productId: string) => void;
}

export interface IStoreSiteTemplateEntry {
  Component: ComponentType<IStoreSiteTemplateProps>;
  defaultTheme: IStoreSiteTheme;
  /** i18n key of the template's name. */
  labelKey: string;
  /** i18n key of one line describing its character. */
  descriptionKey: string;
}
