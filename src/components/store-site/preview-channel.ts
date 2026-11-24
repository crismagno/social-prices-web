import {
  IPublicSiteProduct,
  IPublicSiteStore,
} from "../../shared/business/store-sites/store-sites.types";
import { IStoreSitePage } from "../../shared/business/store-sites/store-site-pages";
import { TBuilderAction } from "./shared/blocks/builder-types";
import { IStoreSiteTemplateProps } from "./template.types";

/** How the editor talks to the preview frame: same origin, two messages. */
export const PREVIEW_READY = "store-site-preview:ready";
export const PREVIEW_DATA = "store-site-preview:data";
/** The preview tells the editor what the owner did on a section. */
export const PREVIEW_BUILDER = "store-site-preview:builder";

export interface IPreviewData {
  site: IStoreSiteTemplateProps["site"];
  store: IPublicSiteStore;
  products: IPublicSiteProduct[];
  /** The page to show; null is the home. */
  page?: IStoreSitePage | null;
  /** The builder's state; absent, the preview is just the site. */
  builder?: { selectedKey: string | null } | null;
}

export interface IPreviewMessage {
  type: typeof PREVIEW_READY | typeof PREVIEW_DATA | typeof PREVIEW_BUILDER;
  data?: IPreviewData;
  action?: TBuilderAction;
}
