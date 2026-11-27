"use client";

import { CSSProperties } from "react";

import {
  IStoreSiteBlock,
  IStoreSiteBlockItem,
} from "../../../../shared/business/store-sites/store-site-blocks";
import {
  IStoreSiteCardLook,
  IStoreSiteCardsStyle,
  siteCardLookOf,
  siteCardsStyleOf,
} from "../../../../shared/business/store-sites/store-site-cards-style";
import StoreSitesEnum from "../../../../shared/business/store-sites/store-sites.enum";
import { getImageUrl } from "../../../../shared/utils/images/images-url";
import Reveal from "../Reveal";
import styles from "./SiteBlocks.module.css";

/** The cards of a section that have something to show. */
export const ownCardsOf = (block: IStoreSiteBlock): IStoreSiteBlockItem[] =>
  block.items.filter(
    (item: IStoreSiteBlockItem) => !!item.title?.trim() || !!item.imageUrl,
  );

/**
 * Whether the owner laid these cards out: then they are drawn here, the same
 * in every template, instead of the template's own way.
 */
export const hasOwnCardsLayout = (block: IStoreSiteBlock): boolean =>
  block.type === StoreSitesEnum.BlockType.CARDS &&
  block.settings.isOwn === true &&
  siteCardsStyleOf(block.settings.cards).layout ===
    StoreSitesEnum.CardsLayout.CUSTOM &&
  ownCardsOf(block).length > 0;

// The class that makes a card take that many places of the line.
const SPAN_CLASS: Record<number, string> = {
  2: styles.ownCardSpan2,
  3: styles.ownCardSpan3,
  4: styles.ownCardSpan4,
};

interface Props {
  block: IStoreSiteBlock;
}

/**
 * Cards as the owner laid them out: so many places a line and the room
 * between them, then each card its own way: how many of those places it
 * takes, where its image sits, how its words align and whether it has a box
 * around it. On a narrow screen they go one under the other.
 */
const PieceCards = ({ block }: Props) => {
  const line: IStoreSiteCardsStyle = siteCardsStyleOf(block.settings.cards);

  return (
    <section
      className={styles.ownCards}
      data-columns={line.columns}
      data-gap={line.gap}
      style={{ "--cards-columns": line.columns } as CSSProperties}
    >
      {ownCardsOf(block).map((card: IStoreSiteBlockItem, index: number) => {
        const look: IStoreSiteCardLook = siteCardLookOf(card.card);

        // A card never takes more places than a line has.
        const span: number = Math.min(look.span, line.columns);

        return (
          <Reveal
            key={card.key}
            effect="up"
            delay={(index % line.columns) * 0.1}
            className={SPAN_CLASS[span] ?? ""}
          >
            <article
              className={styles.ownCard}
              data-side={look.imagePosition}
              data-align={look.textAlign}
              data-look={look.look}
            >
              {card.imageUrl && (
                <div className={styles.ownCardPhoto} data-photo="section">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getImageUrl(card.imageUrl)} alt="" loading="lazy" />
                </div>
              )}
              {(card.title || card.text) && (
                <div className={styles.ownCardBody}>
                  {card.title && (
                    <h2 className={styles.ownCardTitle} data-part="1">
                      {card.title}
                    </h2>
                  )}
                  {card.text && (
                    <p className={styles.ownCardText} data-part="2">
                      {card.text}
                    </p>
                  )}
                </div>
              )}
            </article>
          </Reveal>
        );
      })}
    </section>
  );
};

export default PieceCards;
