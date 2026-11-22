import {
  IPublicSiteProduct,
  IPublicSiteStore,
} from "../../shared/business/store-sites/store-sites.types";
import { IStoreSiteTemplateProps } from "./template.types";

/** How the editor talks to the preview frame: same origin, two messages. */
export const PREVIEW_READY = "store-site-preview:ready";
export const PREVIEW_DATA = "store-site-preview:data";

export interface IPreviewData {
  site: IStoreSiteTemplateProps["site"];
  store: IPublicSiteStore;
  products: IPublicSiteProduct[];
}

export interface IPreviewMessage {
  type: typeof PREVIEW_READY | typeof PREVIEW_DATA;
  data?: IPreviewData;
}
