import { CSSProperties } from "react";

import {
  IMAGE_RATIO_VALUE,
  IMAGE_SHAPE_RADIUS,
  IStoreSiteImageLook,
  IStoreSiteImageStyle,
  SITE_IMAGE_PLACES,
  siteImageStyleOf,
  TSiteImagePlace,
} from "../../../shared/business/store-sites/store-site-image-style";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import base from "./site-base.module.css";

const SHAPE_CLASS: Record<TSiteImagePlace, string> = {
  product: base.imgProductShape,
  section: base.imgSectionShape,
  block: base.imgBlockShape,
};

const RATIO_CLASS: Record<TSiteImagePlace, string> = {
  product: base.imgProductRatio,
  section: base.imgSectionRatio,
  block: base.imgBlockRatio,
};

/**
 * What changes the images the owner reshaped: a class per place and look
 * changed, and the variables they read. Images marked `data-photo="<place>"`
 * follow it; a place left as the template draws it gets nothing.
 */
export const siteImageStyleProps = (
  style: Partial<IStoreSiteImageStyle> | null | undefined,
): { className: string; style: CSSProperties } => {
  const looks: IStoreSiteImageStyle = siteImageStyleOf(style);
  const classes: string[] = [];
  const vars: Record<string, string> = {};

  SITE_IMAGE_PLACES.forEach((place: TSiteImagePlace) => {
    const look: IStoreSiteImageLook = looks[place];

    if (look.shape !== StoreSitesEnum.ImageShape.TEMPLATE) {
      classes.push(SHAPE_CLASS[place]);
      vars[`--img-${place}-radius`] = IMAGE_SHAPE_RADIUS[look.shape];
    }

    if (look.ratio !== StoreSitesEnum.ImageRatio.TEMPLATE) {
      classes.push(RATIO_CLASS[place]);
      vars[`--img-${place}-ratio`] = IMAGE_RATIO_VALUE[look.ratio];
    }
  });

  return { className: classes.join(" "), style: vars as CSSProperties };
};
