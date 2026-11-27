"use client";

import { InputNumber } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  siteSizeRange,
  TSiteSizeKey,
} from "../../../shared/business/store-sites/store-site-sizes";
import { IStoreSiteEditor } from "./useStoreSiteEditor";

interface Props {
  editor: IStoreSiteEditor;
  /** The sizes of the thing just above: its width and height, or its letters. */
  sizes: TSiteSizeKey[];
  className?: string;
  /**
   * Sizes kept somewhere else than the site (a page's own entrance): what
   * they are now, and how one is set. Without these, the site's own sizes.
   */
  values?: Partial<Record<TSiteSizeKey, number | null>>;
  onSizeChange?: (key: TSiteSizeKey, value: number | null) => void;
}

/**
 * The sizes of one element of the site, in pixels. Empty means "as the
 * template draws it", which is what the placeholder says.
 */
const SizeFields = ({
  editor,
  sizes,
  className,
  values: ownValues,
  onSizeChange,
}: Props) => {
  const { t } = useLanguageData();

  if (!editor.draft) {
    return null;
  }

  const values: Partial<Record<TSiteSizeKey, number | null>> =
    ownValues ?? editor.draft.sizes;

  return (
    <div
      className={`grid grid-cols-2 gap-x-3 gap-y-2 ${className ?? "-mt-3 mb-5"}`}
    >
      {sizes.map((key: TSiteSizeKey) => {
        const [min, max] = siteSizeRange(key);

        return (
          <label key={key} className="block min-w-0">
            <span className="block text-xs opacity-70 mb-1 truncate">
              {t(`storeSite.editor.sizes.${key}`)}
            </span>
            <InputNumber
              className="w-full"
              size="small"
              min={min}
              max={max}
              precision={0}
              addonAfter="px"
              placeholder={t("storeSite.editor.sizes.auto")}
              value={values[key]}
              onChange={(value: number | null) =>
                onSizeChange
                  ? onSizeChange(key, typeof value === "number" ? value : null)
                  : // From the draft as it is now: other sizes may have changed.
                    editor.update((draft) => ({
                      sizes: {
                        ...draft.sizes,
                        [key]: typeof value === "number" ? value : null,
                      },
                    }))
              }
            />
          </label>
        );
      })}
    </div>
  );
};

export default SizeFields;
