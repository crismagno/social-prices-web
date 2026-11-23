import { KeyboardEvent } from "react";

import { IPublicSiteProduct } from "../../../shared/business/store-sites/store-sites.types";

export type TProductOpen = ((productId: string) => void) | undefined;

/**
 * What makes the picture of a product open its details: a click, or Enter and
 * Space for who uses the keyboard. Nothing in the editor, where nothing opens.
 */
export const productPhotoOpenProps = (
  product: IPublicSiteProduct,
  onOpen: TProductOpen,
  label: string,
): Record<string, unknown> =>
  onOpen
    ? {
        role: "button",
        tabIndex: 0,
        title: label,
        "aria-label": `${product.name}: ${label}`,
        "data-product-open": "",
        onClick: () => onOpen(product._id),
        onKeyDown: (event: KeyboardEvent) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen(product._id);
          }
        },
      }
    : {};

/** The name opens them too, for the pointer: the picture is the keyboard's way in. */
export const productNameOpenProps = (
  product: IPublicSiteProduct,
  onOpen: TProductOpen,
): Record<string, unknown> =>
  onOpen ? { "data-product-open": "", onClick: () => onOpen(product._id) } : {};
