"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import {
  IPublicSiteProduct,
  ISiteCartItem,
} from "../../../shared/business/store-sites/store-sites.types";
import { ISiteCartApi } from "../template.types";

export interface ISiteCartLine {
  product: IPublicSiteProduct;
  quantity: number;
  lineTotal: number;
}

export interface ISiteCart extends ISiteCartApi {
  items: ISiteCartItem[];
  /** What can be ordered right now. */
  lines: ISiteCartLine[];
  /** Kept in the cart from before, but no longer sold or out of stock. */
  unavailableIds: string[];
  subtotal: number;
  isOpen: boolean;
  close: () => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const storageKey = (slug: string): string => `store-site-cart:${slug}`;

const clampQuantity = (quantity: number): number =>
  Math.max(
    0,
    Math.min(StoreSitesEnum.MAX_ORDER_ITEM_QUANTITY, Math.floor(quantity) || 0),
  );

const readStored = (slug: string): ISiteCartItem[] => {
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(storageKey(slug)) ?? "[]",
    );

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item: any) =>
          typeof item?.productId === "string" && clampQuantity(item?.quantity),
      )
      .map((item: any): ISiteCartItem => ({
        productId: item.productId,
        quantity: clampQuantity(item.quantity),
      }))
      .slice(0, StoreSitesEnum.MAX_ORDER_ITEMS);
  } catch {
    return [];
  }
};

/** The visitor's cart of one site, kept in this browser until the order. */
const useSiteCart = (
  slug: string,
  products: IPublicSiteProduct[],
  isEnabled: boolean = true,
): ISiteCart => {
  const [items, setItems] = useState<ISiteCartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isEnabled) {
      setItems(readStored(slug));
    }

    setIsLoaded(true);
  }, [slug, isEnabled]);

  useEffect(() => {
    if (!isLoaded || !isEnabled) {
      return;
    }

    try {
      window.localStorage.setItem(storageKey(slug), JSON.stringify(items));
    } catch {
      // Storage full or blocked: the cart still works for this visit.
    }
  }, [items, isLoaded, isEnabled, slug]);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const next: number = clampQuantity(quantity);

    setItems((current: ISiteCartItem[]) => {
      const others: ISiteCartItem[] = current.filter(
        (item: ISiteCartItem) => item.productId !== productId,
      );

      if (!next) {
        return others;
      }

      const exists: boolean = others.length !== current.length;

      if (!exists && current.length >= StoreSitesEnum.MAX_ORDER_ITEMS) {
        return current;
      }

      return exists
        ? current.map((item: ISiteCartItem) =>
            item.productId === productId ? { productId, quantity: next } : item,
          )
        : [...current, { productId, quantity: next }];
    });
  }, []);

  const quantityOf = useCallback(
    (productId: string): number =>
      items.find((item: ISiteCartItem) => item.productId === productId)
        ?.quantity ?? 0,
    [items],
  );

  const add = useCallback(
    (productId: string) => {
      if (!isEnabled) {
        return;
      }

      setQuantity(productId, quantityOf(productId) + 1);
      setIsOpen(true);
    },
    [isEnabled, quantityOf, setQuantity],
  );

  const { lines, unavailableIds, subtotal } = useMemo(() => {
    const productById: Map<string, IPublicSiteProduct> = new Map(
      products.map((product: IPublicSiteProduct) => [product._id, product]),
    );

    const available: ISiteCartLine[] = [];
    const unavailable: string[] = [];

    items.forEach(({ productId, quantity }: ISiteCartItem) => {
      const product: IPublicSiteProduct | undefined =
        productById.get(productId);

      if (product?.isAvailable) {
        available.push({
          product,
          quantity,
          lineTotal: Math.round(product.price * quantity * 100) / 100,
        });
      } else {
        unavailable.push(productId);
      }
    });

    return {
      lines: available,
      unavailableIds: unavailable,
      subtotal:
        Math.round(
          available.reduce(
            (total: number, line: ISiteCartLine) => total + line.lineTotal,
            0,
          ) * 100,
        ) / 100,
    };
  }, [items, products]);

  return {
    items,
    lines,
    unavailableIds,
    subtotal,
    count: items.reduce(
      (total: number, item: ISiteCartItem) => total + item.quantity,
      0,
    ),
    quantityOf,
    add,
    setQuantity,
    remove: useCallback(
      (productId: string) => setQuantity(productId, 0),
      [setQuantity],
    ),
    clear: useCallback(() => setItems([]), []),
    isOpen,
    open: useCallback(() => isEnabled && setIsOpen(true), [isEnabled]),
    close: useCallback(() => setIsOpen(false), []),
  };
};

export default useSiteCart;
