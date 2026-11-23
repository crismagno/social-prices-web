import { IStoreSitePage, sitePagePath, sitePagesOf } from "./store-site-pages";
import { completeFooterUrl, isSafeFooterUrl } from "./store-site-footer";
import StoreSitesEnum from "./store-sites.enum";

/** One entry of a block; which fields count depends on the block's type. */
export interface IStoreSiteBlockItem {
  key: string;
  /** A name, a question, a number or a step. */
  title: string | null;
  /** A role, a place or a label. */
  subtitle: string | null;
  /** A quote, an answer or a description. */
  text: string | null;
  /** A photo or a logo: the key of an uploaded image. */
  imageUrl: string | null;
  /** Feature cards only. */
  icon: StoreSitesEnum.FeatureIcon | null;
  /** Testimonials only: 1 to 5 stars. */
  rating: number | null;
}

/** The button of a call-to-action block. */
export interface IStoreSiteBlockButton {
  label: string | null;
  target: StoreSitesEnum.BlockButtonTarget;
  /** A page target: null is the home. */
  pageKey: string | null;
  /** What the owner typed for the other targets: a number, an e-mail, an address. */
  value: string | null;
}

/**
 * A block of content the owner added: team, testimonials, logos, features,
 * questions, numbers, steps or a call to action, on the home or on a page.
 */
export interface IStoreSiteBlock {
  key: string;
  type: StoreSitesEnum.BlockType;
  isActive: boolean;
  /** The page it shows on; null is the home. */
  pageKey: string | null;
  kicker: string | null;
  title: string | null;
  subtitle: string | null;
  items: IStoreSiteBlockItem[];
  /** Calls to action only. */
  button: IStoreSiteBlockButton | null;
}

export const MAX_BLOCKS: number = 20;

/** Sizes the API cuts texts to: the editor stops there too. */
export const BLOCK_LIMITS = {
  kicker: 40,
  title: 120,
  subtitle: 300,
  itemTitle: 80,
  itemSubtitle: 80,
  itemText: 600,
  buttonLabel: 30,
  buttonValue: 300,
} as const;

export const maxItemsOf = (type: StoreSitesEnum.BlockType): number =>
  type === StoreSitesEnum.BlockType.FAQ ? 20 : 12;

type TRecord = Record<string, unknown>;

const recordOf = (value: unknown): TRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as TRecord)
    : {};

const textOf = (value: unknown, max: number): string | null =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;

const oneOf = <T extends string>(value: unknown, options: T[]): T | null =>
  options.includes(value as T) ? (value as T) : null;

/** A short random key, as the API makes them. */
export const newBlockKey = (): string =>
  Math.random().toString(16).slice(2, 14).padEnd(12, "0");

/** Whether an item has what its type shows: the API drops it otherwise. */
export const isUsableItem = (
  type: StoreSitesEnum.BlockType,
  item: IStoreSiteBlockItem,
): boolean => {
  switch (type) {
    case StoreSitesEnum.BlockType.TESTIMONIALS:
      return !!item.text?.trim();
    case StoreSitesEnum.BlockType.LOGOS:
      return !!item.imageUrl || !!item.title?.trim();
    case StoreSitesEnum.BlockType.FAQ:
      return !!item.title?.trim() && !!item.text?.trim();
    case StoreSitesEnum.BlockType.TEAM:
      return !!item.title?.trim() || !!item.imageUrl;
    default:
      return !!item.title?.trim() || !!item.text?.trim();
  }
};

const itemOf = (
  type: StoreSitesEnum.BlockType,
  raw: unknown,
): IStoreSiteBlockItem => {
  const source: TRecord = recordOf(raw);

  const rating: number =
    typeof source.rating === "number" && Number.isFinite(source.rating)
      ? Math.min(5, Math.max(1, Math.round(source.rating)))
      : 5;

  return {
    key:
      typeof source.key === "string" && source.key ? source.key : newBlockKey(),
    title: textOf(source.title, BLOCK_LIMITS.itemTitle),
    subtitle: textOf(source.subtitle, BLOCK_LIMITS.itemSubtitle),
    text: textOf(source.text, BLOCK_LIMITS.itemText),
    imageUrl: textOf(source.imageUrl, 600),
    icon:
      type === StoreSitesEnum.BlockType.FEATURES
        ? (oneOf(source.icon, Object.values(StoreSitesEnum.FeatureIcon)) ??
          StoreSitesEnum.FeatureIcon.STAR)
        : null,
    rating: type === StoreSitesEnum.BlockType.TESTIMONIALS ? rating : null,
  };
};

const buttonOf = (raw: unknown): IStoreSiteBlockButton => {
  const source: TRecord = recordOf(raw);

  const target: StoreSitesEnum.BlockButtonTarget =
    oneOf(source.target, Object.values(StoreSitesEnum.BlockButtonTarget)) ??
    StoreSitesEnum.BlockButtonTarget.PAGE;

  const isPage: boolean = target === StoreSitesEnum.BlockButtonTarget.PAGE;

  return {
    label: textOf(source.label, BLOCK_LIMITS.buttonLabel),
    target,
    pageKey: isPage ? textOf(source.pageKey, 40) : null,
    value: isPage ? null : textOf(source.value, BLOCK_LIMITS.buttonValue),
  };
};

/**
 * The blocks of a site, also for one saved before blocks existed: none. The
 * same shape the API keeps; the editor works on this, and the API checks again.
 */
export const siteBlocksOf = (blocks: unknown): IStoreSiteBlock[] =>
  (Array.isArray(blocks) ? blocks : [])
    .map(recordOf)
    .filter((source: TRecord) =>
      Object.values(StoreSitesEnum.BlockType).includes(
        source.type as StoreSitesEnum.BlockType,
      ),
    )
    .slice(0, MAX_BLOCKS)
    .map((source: TRecord): IStoreSiteBlock => {
      const type = source.type as StoreSitesEnum.BlockType;

      return {
        key:
          typeof source.key === "string" && source.key
            ? source.key
            : newBlockKey(),
        type,
        isActive: source.isActive !== false,
        pageKey: textOf(source.pageKey, 40),
        kicker: textOf(source.kicker, BLOCK_LIMITS.kicker),
        title: textOf(source.title, BLOCK_LIMITS.title),
        subtitle: textOf(source.subtitle, BLOCK_LIMITS.subtitle),
        items:
          type === StoreSitesEnum.BlockType.CTA || !Array.isArray(source.items)
            ? []
            : source.items
                .map((item: unknown) => itemOf(type, item))
                .slice(0, maxItemsOf(type)),
        // A button the API left out (it went nowhere safe) stays out.
        button:
          type === StoreSitesEnum.BlockType.CTA && source.button
            ? buttonOf(source.button)
            : null,
      };
    });

const FOOTER_TYPE_OF: Record<
  Exclude<
    StoreSitesEnum.BlockButtonTarget,
    StoreSitesEnum.BlockButtonTarget.PAGE
  >,
  StoreSitesEnum.FooterLinkType
> = {
  [StoreSitesEnum.BlockButtonTarget.WHATSAPP]:
    StoreSitesEnum.FooterLinkType.WHATSAPP,
  [StoreSitesEnum.BlockButtonTarget.PHONE]: StoreSitesEnum.FooterLinkType.PHONE,
  [StoreSitesEnum.BlockButtonTarget.EMAIL]: StoreSitesEnum.FooterLinkType.EMAIL,
  [StoreSitesEnum.BlockButtonTarget.URL]: StoreSitesEnum.FooterLinkType.WEBSITE,
};

/** Whether the page a block or button points at is there: null is the home. */
export const isPageThere = (
  pageKey: string | null,
  pages: IStoreSitePage[] | null | undefined,
): boolean =>
  pageKey === null ||
  sitePagesOf(pages).some((page: IStoreSitePage) => page.key === pageKey);

/** Where a call-to-action button goes, or null when it goes nowhere safe. */
export const blockButtonHref = (
  button: IStoreSiteBlockButton | null,
  siteSlug: string,
  pages: IStoreSitePage[] | null | undefined,
): string | null => {
  if (!button) {
    return null;
  }

  if (button.target === StoreSitesEnum.BlockButtonTarget.PAGE) {
    if (!isPageThere(button.pageKey, pages)) {
      return null;
    }

    const page: IStoreSitePage | undefined = sitePagesOf(pages).find(
      (each: IStoreSitePage) => each.key === button.pageKey,
    );

    return sitePagePath(siteSlug, page?.slug ?? null);
  }

  const href: string | null = completeFooterUrl(
    FOOTER_TYPE_OF[button.target],
    button.value ?? "",
  );

  return isSafeFooterUrl(href) ? href : null;
};

/** The blocks shown on one page (null is the home), in their order. */
export const blocksForPage = (
  blocks: unknown,
  pageKey: string | null,
  pages: IStoreSitePage[] | null | undefined,
): IStoreSiteBlock[] =>
  siteBlocksOf(blocks)
    .filter(
      (block: IStoreSiteBlock) =>
        block.isActive &&
        block.pageKey === pageKey &&
        isPageThere(block.pageKey, pages),
    )
    .map((block: IStoreSiteBlock) => ({
      ...block,
      items: block.items.filter((item: IStoreSiteBlockItem) =>
        isUsableItem(block.type, item),
      ),
    }))
    .filter((block: IStoreSiteBlock) =>
      block.type === StoreSitesEnum.BlockType.CTA
        ? !!block.title
        : block.items.length > 0,
    );

type TTranslate = (key: string) => string;

const SAMPLE_ITEMS: Record<StoreSitesEnum.BlockType, number> = {
  [StoreSitesEnum.BlockType.TEAM]: 3,
  [StoreSitesEnum.BlockType.TESTIMONIALS]: 3,
  [StoreSitesEnum.BlockType.LOGOS]: 5,
  [StoreSitesEnum.BlockType.FEATURES]: 3,
  [StoreSitesEnum.BlockType.FAQ]: 3,
  [StoreSitesEnum.BlockType.STATS]: 3,
  [StoreSitesEnum.BlockType.STEPS]: 3,
  [StoreSitesEnum.BlockType.CTA]: 0,
};

const SAMPLE_ICONS: StoreSitesEnum.FeatureIcon[] = [
  StoreSitesEnum.FeatureIcon.ROCKET,
  StoreSitesEnum.FeatureIcon.SHIELD,
  StoreSitesEnum.FeatureIcon.HEART,
];

/** The fields a sample item of each type fills. */
const SAMPLE_FIELDS: Record<
  StoreSitesEnum.BlockType,
  ("title" | "subtitle" | "text")[]
> = {
  [StoreSitesEnum.BlockType.TEAM]: ["title", "subtitle"],
  [StoreSitesEnum.BlockType.TESTIMONIALS]: ["title", "subtitle", "text"],
  [StoreSitesEnum.BlockType.LOGOS]: ["title"],
  [StoreSitesEnum.BlockType.FEATURES]: ["title", "text"],
  [StoreSitesEnum.BlockType.FAQ]: ["title", "text"],
  [StoreSitesEnum.BlockType.STATS]: ["title", "subtitle"],
  [StoreSitesEnum.BlockType.STEPS]: ["title", "text"],
  [StoreSitesEnum.BlockType.CTA]: [],
};

/** An empty item of a type, for "+ item". */
export const newBlockItem = (
  type: StoreSitesEnum.BlockType,
): IStoreSiteBlockItem => itemOf(type, {});

/**
 * A new block with sample words, so the preview shows it at once. The words
 * come from the language of the panel.
 */
export const newBlock = (
  type: StoreSitesEnum.BlockType,
  t: TTranslate,
): IStoreSiteBlock => {
  const base: string = `storeSite.editor.blocks.samples.${type}`;

  return {
    key: newBlockKey(),
    type,
    isActive: true,
    pageKey: null,
    kicker: t(`${base}.kicker`),
    title: t(`${base}.title`),
    subtitle: t(`${base}.subtitle`),
    items: Array.from({ length: SAMPLE_ITEMS[type] }, (_, index: number) => {
      const item: IStoreSiteBlockItem = newBlockItem(type);

      SAMPLE_FIELDS[type].forEach((field) => {
        item[field] = t(`${base}.items.${index}.${field}`);
      });

      if (type === StoreSitesEnum.BlockType.FEATURES) {
        item.icon = SAMPLE_ICONS[index % SAMPLE_ICONS.length];
      }

      return item;
    }),
    button:
      type === StoreSitesEnum.BlockType.CTA
        ? {
            label: t(`${base}.button`),
            target: StoreSitesEnum.BlockButtonTarget.PAGE,
            pageKey: null,
            value: null,
          }
        : null,
  };
};
