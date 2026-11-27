"use client";

import { Card, Form, Segmented } from "antd";

import useLanguageData from "../../../data/context/language/useLanguageData";
import { IStoreSiteBlock } from "../../../shared/business/store-sites/store-site-blocks";
import {
  IStoreSiteCardsStyle,
  siteCardsStyleOf,
} from "../../../shared/business/store-sites/store-site-cards-style";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";

interface Props {
  block: IStoreSiteBlock;
  onChange: (
    change: (current: IStoreSiteBlock) => Partial<IStoreSiteBlock>,
  ) => void;
}

const KEY = "storeSite.editor.cards";

const [MIN_COLUMNS, MAX_COLUMNS] = StoreSitesEnum.CARDS_COLUMNS_RANGE;

const COLUMNS: number[] = Array.from(
  { length: MAX_COLUMNS - MIN_COLUMNS + 1 },
  (_, index: number) => MIN_COLUMNS + index,
);

/**
 * The line the cards of a section are laid out on: the template's own way, or
 * the owner's, with how many places a line has and the room between them.
 * What is each card's own (its image, words, box and width) is set on the card.
 */
const CardsLayoutFields = ({ block, onChange }: Props) => {
  const { t } = useLanguageData();

  const look: IStoreSiteCardsStyle = siteCardsStyleOf(block.settings.cards);

  const isCustom: boolean = look.layout === StoreSitesEnum.CardsLayout.CUSTOM;

  // The layout belongs to cards with content of their own.
  const set = (patch: Partial<IStoreSiteCardsStyle>): void =>
    onChange((current) => ({
      settings: {
        ...current.settings,
        isOwn: true,
        cards: { ...siteCardsStyleOf(current.settings.cards), ...patch },
      },
    }));

  return (
    <Card size="small" title={t(`${KEY}.heading`)}>
      <Form layout="vertical">
        <Form.Item
          className={isCustom ? "" : "mb-0"}
          extra={t(`${KEY}.layoutHints.${look.layout}`)}
        >
          <Segmented<StoreSitesEnum.CardsLayout>
            block
            value={look.layout}
            onChange={(layout) => set({ layout })}
            options={Object.values(StoreSitesEnum.CardsLayout).map(
              (layout: StoreSitesEnum.CardsLayout) => ({
                value: layout,
                label: t(`${KEY}.layouts.${layout}`),
              }),
            )}
          />
        </Form.Item>

        {isCustom && (
          <>
            <Form.Item
              label={t(`${KEY}.columns`)}
              extra={t(`${KEY}.columnsHint`)}
            >
              <Segmented<number>
                block
                value={look.columns}
                onChange={(columns) => set({ columns })}
                options={COLUMNS}
              />
            </Form.Item>

            <Form.Item
              className="mb-0"
              label={t(`${KEY}.gap`)}
              extra={t(`${KEY}.eachHint`)}
            >
              <Segmented<StoreSitesEnum.CardsGap>
                block
                value={look.gap}
                onChange={(gap) => set({ gap })}
                options={Object.values(StoreSitesEnum.CardsGap).map(
                  (gap: StoreSitesEnum.CardsGap) => ({
                    value: gap,
                    label: t(`${KEY}.gaps.${gap}`),
                  }),
                )}
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Card>
  );
};

export default CardsLayoutFields;
