import { CSSProperties } from "react";

import { IStoreSiteBlock } from "../../../../shared/business/store-sites/store-site-blocks";
import { IStoreSitePage } from "../../../../shared/business/store-sites/store-site-pages";

/** What a section needs to know about the site it is on. */
export interface IBlockContext {
  siteSlug: string;
  pages: IStoreSitePage[] | null | undefined;
  /** The editor's preview: nothing navigates. */
  mode: "live" | "preview";
}

/** What every block component receives. */
export interface IBlockProps {
  block: IStoreSiteBlock;
  /** The turn of its n-th part to come in, after the heading's. */
  step: (index: number) => CSSProperties;
  context: IBlockContext;
}
