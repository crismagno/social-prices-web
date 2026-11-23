import { CSSProperties } from "react";

import { IStoreSiteBlock } from "../../../../shared/business/store-sites/store-site-blocks";

/** What every block component receives. */
export interface IBlockProps {
  block: IStoreSiteBlock;
  /** The turn of its n-th part to come in, after the heading's. */
  step: (index: number) => CSSProperties;
}
