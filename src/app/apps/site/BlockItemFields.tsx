"use client";

import { Divider, Form, Input, Rate, Segmented, Select, Switch } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import {
  BLOCK_LIMITS,
  IStoreSiteBlockItem,
  newBlockButton,
} from "../../../shared/business/store-sites/store-site-blocks";
import {
  IStoreSiteCardLook,
  siteCardLookOf,
} from "../../../shared/business/store-sites/store-site-cards-style";
import { IStoreSitePage } from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import ButtonFields from "./ButtonFields";
import FeatureIconPicker from "./FeatureIconPicker";
import ImageField from "./ImageField";

type TField =
  "imageUrl" | "icon" | "rating" | "title" | "subtitle" | "text" | "button";

/** The fields each kind of block asks of its items, in the order shown. */
export const ITEM_FIELDS: Partial<Record<StoreSitesEnum.BlockType, TField[]>> =
  {
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
    [StoreSitesEnum.BlockType.IMAGE]: ["imageUrl", "text"],
    [StoreSitesEnum.BlockType.BOX]: ["imageUrl", "title", "text", "button"],
    [StoreSitesEnum.BlockType.CTA]: [],
    [StoreSitesEnum.BlockType.CARDS]: ["imageUrl", "title", "text"],
  };

interface Props {
  type: StoreSitesEnum.BlockType;
  item: IStoreSiteBlockItem;
  storeId: string;
  /** Where a button can lead. */
  pages: IStoreSitePage[];
  /** Applied to the item as it is then: an upload may finish later. */
  onChange: (patch: Partial<IStoreSiteBlockItem>) => void;
  /**
   * Cards the owner lays out: how many places their line has. Then each card
   * also asks how it is drawn. Absent, the template draws them all its way.
   */
  cardColumns?: number | null;
}

const CARD = "storeSite.editor.cards.card";

/** One item of a block: only the fields its kind of block shows. */
const BlockItemFields = ({
  type,
  item,
  storeId,
  pages,
  onChange,
  cardColumns,
}: Props) => {
  const { t } = useLanguageData();

  const card: IStoreSiteCardLook = siteCardLookOf(item.card);

  const setCard = (patch: Partial<IStoreSiteCardLook>): void =>
    onChange({ card: { ...card, ...patch } });

  const label = (field: TField): string =>
    t(`storeSite.editor.blocks.fields.${type}.${field}`);

  return (
    <Form layout="vertical">
      {(ITEM_FIELDS[type] ?? []).map((field: TField) => {
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
          case "button":
            return (
              <div key={field}>
                <Form.Item label={label(field)}>
                  <Switch
                    checked={!!item.button}
                    onChange={(isOn: boolean) =>
                      onChange({ button: isOn ? newBlockButton() : null })
                    }
                  />
                </Form.Item>
                {item.button && (
                  <ButtonFields
                    button={item.button}
                    pages={pages}
                    withVariant
                    onChange={(patch) =>
                      onChange({
                        button: newBlockButton({ ...item.button, ...patch }),
                      })
                    }
                  />
                )}
              </div>
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
      {type === StoreSitesEnum.BlockType.CARDS && !!cardColumns && (
        <>
          <Divider orientation="left" plain>
            {t(`${CARD}.heading`)}
          </Divider>

          <Form.Item label={t(`${CARD}.imagePosition`)}>
            <Select<StoreSitesEnum.CardsImagePosition>
              value={card.imagePosition}
              onChange={(imagePosition) => setCard({ imagePosition })}
              options={Object.values(StoreSitesEnum.CardsImagePosition).map(
                (position: StoreSitesEnum.CardsImagePosition) => ({
                  value: position,
                  label: t(`${CARD}.imagePositions.${position}`),
                }),
              )}
            />
          </Form.Item>

          <Form.Item label={t(`${CARD}.textAlign`)}>
            <Segmented<StoreSitesEnum.CardsAlign>
              block
              value={card.textAlign}
              onChange={(textAlign) => setCard({ textAlign })}
              options={Object.values(StoreSitesEnum.CardsAlign).map(
                (align: StoreSitesEnum.CardsAlign) => ({
                  value: align,
                  label: t(`${CARD}.aligns.${align}`),
                }),
              )}
            />
          </Form.Item>

          <Form.Item label={t(`${CARD}.look`)}>
            <Segmented<StoreSitesEnum.CardsLook>
              block
              value={card.look}
              onChange={(look) => setCard({ look })}
              options={Object.values(StoreSitesEnum.CardsLook).map(
                (look: StoreSitesEnum.CardsLook) => ({
                  value: look,
                  label: t(`${CARD}.looks.${look}`),
                }),
              )}
            />
          </Form.Item>

          <Form.Item
            className="mb-0"
            label={t(`${CARD}.span`)}
            extra={t(`${CARD}.spanHint`)}
          >
            <Segmented<number>
              block
              value={Math.min(card.span, cardColumns)}
              onChange={(span) => setCard({ span })}
              options={Array.from(
                { length: cardColumns },
                (_, index: number) => index + 1,
              )}
            />
          </Form.Item>
        </>
      )}
    </Form>
  );
};

export default BlockItemFields;
