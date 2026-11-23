"use client";

import { Form, Input, Rate } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  BLOCK_LIMITS,
  IStoreSiteBlockItem,
} from "../../../shared/business/store-sites/store-site-blocks";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import FeatureIconPicker from "./FeatureIconPicker";
import ImageField from "./ImageField";

type TField = "imageUrl" | "icon" | "rating" | "title" | "subtitle" | "text";

/** The fields each kind of block asks of its items, in the order shown. */
export const ITEM_FIELDS: Record<StoreSitesEnum.BlockType, TField[]> = {
  [StoreSitesEnum.BlockType.TEAM]: ["imageUrl", "title", "subtitle", "text"],
  [StoreSitesEnum.BlockType.TESTIMONIALS]: [
    "text",
    "rating",
    "title",
    "subtitle",
    "imageUrl",
  ],
  [StoreSitesEnum.BlockType.LOGOS]: ["imageUrl", "title"],
  [StoreSitesEnum.BlockType.FEATURES]: ["icon", "title", "text"],
  [StoreSitesEnum.BlockType.FAQ]: ["title", "text"],
  [StoreSitesEnum.BlockType.STATS]: ["title", "subtitle"],
  [StoreSitesEnum.BlockType.STEPS]: ["title", "text"],
  [StoreSitesEnum.BlockType.CTA]: [],
};

interface Props {
  type: StoreSitesEnum.BlockType;
  item: IStoreSiteBlockItem;
  storeId: string;
  /** Applied to the item as it is then: an upload may finish later. */
  onChange: (patch: Partial<IStoreSiteBlockItem>) => void;
}

/** One item of a block: only the fields its kind of block shows. */
const BlockItemFields = ({ type, item, storeId, onChange }: Props) => {
  const { t } = useLanguageData();

  const label = (field: TField): string =>
    t(`storeSite.editor.blocks.fields.${type}.${field}`);

  return (
    <Form layout="vertical">
      {ITEM_FIELDS[type].map((field: TField) => {
        switch (field) {
          case "imageUrl":
            return (
              <Form.Item key={field} label={label(field)}>
                <ImageField
                  storeId={storeId}
                  value={item.imageUrl}
                  onChange={(imageUrl: string | null) => onChange({ imageUrl })}
                />
              </Form.Item>
            );
          case "icon":
            return (
              <Form.Item key={field} label={label(field)}>
                <FeatureIconPicker
                  value={item.icon}
                  onChange={(icon: StoreSitesEnum.FeatureIcon) =>
                    onChange({ icon })
                  }
                />
              </Form.Item>
            );
          case "rating":
            return (
              <Form.Item key={field} label={label(field)}>
                <Rate
                  value={item.rating ?? 5}
                  allowClear={false}
                  onChange={(rating: number) => onChange({ rating })}
                />
              </Form.Item>
            );
          case "text":
            return (
              <Form.Item key={field} label={label(field)}>
                <Input.TextArea
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  maxLength={BLOCK_LIMITS.itemText}
                  showCount
                  value={item.text ?? ""}
                  onChange={(event) => onChange({ text: event.target.value })}
                />
              </Form.Item>
            );
          default:
            return (
              <Form.Item key={field} label={label(field)}>
                <Input
                  maxLength={
                    field === "title"
                      ? BLOCK_LIMITS.itemTitle
                      : BLOCK_LIMITS.itemSubtitle
                  }
                  value={item[field] ?? ""}
                  onChange={(event) =>
                    onChange({ [field]: event.target.value })
                  }
                />
              </Form.Item>
            );
        }
      })}
    </Form>
  );
};

export default BlockItemFields;
