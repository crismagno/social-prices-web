"use client";

import { useEffect, useMemo, useState } from "react";

import { Button, Empty, Input, Modal, Tag } from "antd";

import { CheckOutlined, SearchOutlined } from "@ant-design/icons";

import { formatSiteMoney } from "../../../components/store-site/shared/site-format";
import useLanguageData from "../../../data/context/language/useLanguageData";
import { IProduct } from "../../../shared/business/products/products.interface";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { getImageUrl } from "../../../shared/utils/images/images-url";

interface Props {
  open: boolean;
  /** The store's products that can be put on the site. */
  products: IProduct[];
  /** What the site shows now, in its order. */
  chosenIds: string[];
  onClose: () => void;
  /** The new choice, in the site's order. */
  onApply: (productIds: string[]) => void;
}

const normalize = (value: string): string =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Every product of the store in a grid, to mark at once which go on the site
 * and which do not. What stays keeps its place; what is added goes last, in
 * the order of the grid.
 */
const ProductPickerModal = ({
  open,
  products,
  chosenIds,
  onClose,
  onApply,
}: Props) => {
  const { t } = useLanguageData();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState<string>("");

  // Each opening starts from what the site shows now.
  useEffect(() => {
    if (open) {
      setSelected(new Set(chosenIds));
      setSearch("");
    }
  }, [open, chosenIds]);

  const shown: IProduct[] = useMemo(() => {
    const words: string = normalize(search.trim());

    return words
      ? products.filter((product: IProduct) =>
          normalize(product.name).includes(words),
        )
      : products;
  }, [products, search]);

  const max: number = StoreSitesEnum.MAX_PRODUCTS;
  const isFull: boolean = selected.size >= max;

  const toggle = (productId: string): void =>
    setSelected((current: Set<string>) => {
      const next: Set<string> = new Set(current);

      if (next.has(productId)) {
        next.delete(productId);
      } else if (next.size < max) {
        next.add(productId);
      }

      return next;
    });

  // The products on screen, up to the limit.
  const selectShown = (): void =>
    setSelected((current: Set<string>) => {
      const next: Set<string> = new Set(current);

      for (const product of shown) {
        if (next.size >= max) {
          break;
        }

        next.add(product._id);
      }

      return next;
    });

  const clearShown = (): void =>
    setSelected((current: Set<string>) => {
      const next: Set<string> = new Set(current);

      shown.forEach((product: IProduct) => next.delete(product._id));

      return next;
    });

  const apply = (): void => {
    const kept: string[] = chosenIds.filter((id: string) => selected.has(id));

    const added: string[] = products
      .map((product: IProduct) => product._id)
      .filter((id: string) => selected.has(id) && !chosenIds.includes(id));

    onApply([...kept, ...added]);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={880}
      title={t("storeSite.editor.products.pickTitle")}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm">
            {t("storeSite.editor.products.selected")
              .replace("{count}", String(selected.size))
              .replace("{max}", String(max))}
          </span>
          <span className="flex gap-2">
            <Button onClick={onClose}>
              {t("storeSite.editor.products.cancel")}
            </Button>
            <Button type="primary" onClick={apply}>
              {t("storeSite.editor.products.apply")}
            </Button>
          </span>
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Input
          allowClear
          className="flex-1 min-w-[200px]"
          prefix={<SearchOutlined className="opacity-50" />}
          placeholder={t("storeSite.editor.products.search")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Button onClick={selectShown} disabled={isFull || !shown.length}>
          {t("storeSite.editor.products.selectAll")}
        </Button>
        <Button onClick={clearShown} disabled={!shown.length}>
          {t("storeSite.editor.products.clearAll")}
        </Button>
      </div>

      {isFull && (
        <Tag color="warning" className="mb-3">
          {t("storeSite.editor.products.full").replace("{max}", String(max))}
        </Tag>
      )}

      {shown.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t("storeSite.editor.products.noMatch")}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto p-1">
          {shown.map((product: IProduct) => {
            const isOn: boolean = selected.has(product._id);
            const isLocked: boolean = !isOn && isFull;

            return (
              <button
                key={product._id}
                type="button"
                aria-pressed={isOn}
                disabled={isLocked}
                onClick={() => toggle(product._id)}
                className={`relative flex flex-col text-left rounded-xl border-2 overflow-hidden transition-all ${
                  isOn
                    ? "border-blue-500 shadow-md"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                } ${isLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span
                  className="block aspect-square w-full bg-gray-100 dark:bg-gray-800 bg-center bg-cover"
                  style={
                    product.mainUrl
                      ? {
                          backgroundImage: `url("${getImageUrl(product.mainUrl)}")`,
                        }
                      : undefined
                  }
                />
                {/* Only a mark: the whole card is the control. */}
                <span
                  aria-hidden="true"
                  className={`absolute top-2 right-2 grid place-items-center w-6 h-6 rounded-full border-2 text-xs ${
                    isOn
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-white/90 border-gray-300"
                  }`}
                >
                  {isOn && <CheckOutlined />}
                </span>
                <span className="px-2 py-2">
                  <span className="block text-sm font-medium truncate">
                    {product.name}
                  </span>
                  <span className="block text-xs opacity-70">
                    {formatSiteMoney(product.price)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

export default ProductPickerModal;
