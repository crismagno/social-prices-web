import {
  IStoreSiteAboutMedia,
  embedUrlOf,
  isKnownPlayer,
  siteAboutOf,
} from "./store-site-about";
import { IStoreSitePage, sitePagePath, sitePagesOf } from "./store-site-pages";
import { completeFooterUrl, isSafeFooterUrl } from "./store-site-footer";
import {
  IStoreSiteMarqueeStyle,
  siteMarqueeStyleOf,
} from "./store-site-marquee-style";
import {
  IStoreSiteCardLook,
  IStoreSiteCardsStyle,
  siteCardLookOf,
  siteCardsStyleOf,
} from "./store-site-cards-style";
import StoreSitesEnum from "./store-sites.enum";

/** One entry of a block; which fields count depends on the block's type. */
export interface IStoreSiteBlockItem {
  key: string;
  /**
   * An item of a menu of tabs only: the keys of the sections of its page it
   * shows, one or several (a text, an image, a block...), in the page's order.
   */
  sectionKeys: string[];
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
  /** A column of a box only. */
  button: IStoreSiteBlockButton | null;
  /** A card only: how this one is drawn. */
  card: IStoreSiteCardLook | null;
}

/** The button of a call-to-action block. */
export interface IStoreSiteBlockButton {
  label: string | null;
  target: StoreSitesEnum.BlockButtonTarget;
  /** A page target: null is the home. */
  pageKey: string | null;
  /** What the owner typed for the other targets: a number, an e-mail, an address. */
  value: string | null;
  variant: StoreSitesEnum.ButtonVariant;
}

/** The few options a piece of the page has; null where its type has none. */
export interface IStoreSiteBlockSettings {
  align: StoreSitesEnum.SectionAlign | null;
  width: StoreSitesEnum.SectionWidth | null;
  tone: StoreSitesEnum.SectionTone | null;
  /** A spacer's height in pixels. */
  height: number | null;
  divider: StoreSitesEnum.DividerStyle | null;
  /** A video piece: an uploaded video or a YouTube/Vimeo player. */
  media: IStoreSiteAboutMedia | null;
  /** A menu of tabs: in a row on top, or down the side. */
  menuStyle: StoreSitesEnum.MenuStyle | null;
  /** A menu of tabs: one section at a time, or all of them to scroll to. */
  menuMode: StoreSitesEnum.MenuMode | null;
  /** A menu down the side: on the left or on the right. */
  menuSide: StoreSitesEnum.MenuSide | null;
  /** A menu of tabs: how its items look. */
  menuLook: StoreSitesEnum.MenuLook | null;
  /** A menu of tabs: how a section comes in when its item is chosen. */
  menuEffect: StoreSitesEnum.MenuEffect | null;
  /** A menu of tabs: where it stays while the visitor scrolls its sections. */
  menuPlace: StoreSitesEnum.MenuPlace | null;
  /**
   * A strip or cards: true once it has content of its own (its items). One
   * placed before they had any still shows what the site had for all of them.
   */
  isOwn: boolean | null;
  /** A strip with content of its own: how it looks and runs. */
  marquee: IStoreSiteMarqueeStyle | null;
  /** A text with media: the side its image or video is on. */
  mediaPosition: StoreSitesEnum.AboutMediaPosition | null;
  /** Cards with content of their own: how they are laid out. */
  cards: IStoreSiteCardsStyle | null;
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
  /** A row of buttons only. */
  buttons: IStoreSiteBlockButton[];
  settings: IStoreSiteBlockSettings;
}

/** Sections of the whole site, every page together. */
export const MAX_BLOCKS: number = 60;
export const MAX_SECTION_BUTTONS: number = 20;
/** The most sections one item of a menu of tabs shows. */
export const MAX_TAB_SECTIONS: number = 12;
export const SPACER_LIMITS = { min: 8, max: 240, initial: 48 } as const;

export const isPartType = (type: StoreSitesEnum.BlockType): boolean =>
  StoreSitesEnum.PART_TYPES.includes(type);

/** A part a page has at most once: the others can be added again and copied. */
export const isUniquePartType = (type: StoreSitesEnum.BlockType): boolean =>
  StoreSitesEnum.UNIQUE_PART_TYPES.includes(type);

/** A strip, cards or a text with media: components with content of their own. */
export const isOwnPartType = (type: StoreSitesEnum.BlockType): boolean =>
  type === StoreSitesEnum.BlockType.MARQUEE ||
  type === StoreSitesEnum.BlockType.CARDS ||
  type === StoreSitesEnum.BlockType.ABOUT;

/** Sizes the API cuts texts to: the editor stops there too. */
export const BLOCK_LIMITS = {
  kicker: 40,
  title: 120,
  subtitle: 300,
  textBody: 2000,
  itemTitle: 80,
  itemSubtitle: 80,
  itemText: 600,
  paragraph: 1500,
  buttonLabel: 30,
  buttonValue: 300,
} as const;

export const maxItemsOf = (type: StoreSitesEnum.BlockType): number => {
  switch (type) {
    case StoreSitesEnum.BlockType.FAQ:
      return 20;
    case StoreSitesEnum.BlockType.BOX:
      return 20;
    case StoreSitesEnum.BlockType.IMAGE:
      return 1;
    case StoreSitesEnum.BlockType.ABOUT:
      return StoreSitesEnum.MAX_ABOUT_TEXTS;
    default:
      return 20;
  }
};

/** Types whose content lives in the items list. */
const WITH_ITEMS: StoreSitesEnum.BlockType[] = [
  StoreSitesEnum.BlockType.TEAM,
  StoreSitesEnum.BlockType.TESTIMONIALS,
  StoreSitesEnum.BlockType.LOGOS,
  StoreSitesEnum.BlockType.FEATURES,
  StoreSitesEnum.BlockType.FAQ,
  StoreSitesEnum.BlockType.STATS,
  StoreSitesEnum.BlockType.STEPS,
  StoreSitesEnum.BlockType.IMAGE,
  StoreSitesEnum.BlockType.BOX,
  StoreSitesEnum.BlockType.TABS,
  // Components with content of their own: the phrases, the cards.
  StoreSitesEnum.BlockType.MARQUEE,
  StoreSitesEnum.BlockType.CARDS,
  // A text with media: its paragraphs.
  StoreSitesEnum.BlockType.ABOUT,
];

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
    case StoreSitesEnum.BlockType.IMAGE:
      return !!item.imageUrl;
    case StoreSitesEnum.BlockType.BOX:
      return (
        !!item.title?.trim() ||
        !!item.text?.trim() ||
        !!item.imageUrl ||
        !!item.button
      );
    default:
      return !!item.title?.trim() || !!item.text?.trim();
  }
};

/**
 * The sections an item of a menu of tabs shows: keys, no blanks, no repeats.
 * An item saved when it showed one section only had it as `sectionKey`.
 */
const sectionKeysOf = (source: TRecord): string[] => {
  const given: unknown[] = Array.isArray(source.sectionKeys)
    ? source.sectionKeys
    : [source.sectionKey];

  const keys: string[] = given
    .map((key: unknown) => textOf(key, 40))
    .filter((key: string | null): key is string => !!key);

  return Array.from(new Set(keys)).slice(0, MAX_TAB_SECTIONS);
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
    sectionKeys:
      type === StoreSitesEnum.BlockType.TABS ? sectionKeysOf(source) : [],
    title: textOf(source.title, BLOCK_LIMITS.itemTitle),
    subtitle: textOf(source.subtitle, BLOCK_LIMITS.itemSubtitle),
    text: textOf(
      source.text,
      type === StoreSitesEnum.BlockType.ABOUT
        ? BLOCK_LIMITS.paragraph
        : BLOCK_LIMITS.itemText,
    ),
    imageUrl: textOf(source.imageUrl, 600),
    icon:
      type === StoreSitesEnum.BlockType.FEATURES
        ? (oneOf(source.icon, Object.values(StoreSitesEnum.FeatureIcon)) ??
          StoreSitesEnum.FeatureIcon.STAR)
        : null,
    rating: type === StoreSitesEnum.BlockType.TESTIMONIALS ? rating : null,
    button:
      type === StoreSitesEnum.BlockType.BOX && source.button
        ? buttonOf(source.button)
        : null,
    card:
      type === StoreSitesEnum.BlockType.CARDS
        ? siteCardLookOf(source.card as Partial<IStoreSiteCardLook> | null)
        : null,
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
    variant:
      oneOf(source.variant, Object.values(StoreSitesEnum.ButtonVariant)) ??
      StoreSitesEnum.ButtonVariant.PRIMARY,
  };
};

/** A new button: to the home, in the template's main style. */
export const newBlockButton = (
  patch: Partial<IStoreSiteBlockButton> = {},
): IStoreSiteBlockButton => ({
  label: null,
  target: StoreSitesEnum.BlockButtonTarget.PAGE,
  pageKey: null,
  value: null,
  variant: StoreSitesEnum.ButtonVariant.PRIMARY,
  ...patch,
});

const mediaOf = (raw: unknown): IStoreSiteAboutMedia | null => {
  const source: TRecord = recordOf(raw);
  const url: string = typeof source.url === "string" ? source.url.trim() : "";

  if (source.type === StoreSitesEnum.AboutMediaType.EMBED) {
    const embed: string | null = isKnownPlayer(url) ? url : embedUrlOf(url);

    return embed
      ? { type: StoreSitesEnum.AboutMediaType.EMBED, url: embed }
      : null;
  }

  return source.type === StoreSitesEnum.AboutMediaType.VIDEO && url
    ? { type: StoreSitesEnum.AboutMediaType.VIDEO, url }
    : null;
};

/** The options of a piece; each kept only by the types that use it. */
export const blockSettingsOf = (
  type: StoreSitesEnum.BlockType,
  raw: unknown,
): IStoreSiteBlockSettings => {
  const source: TRecord = recordOf(raw);
  const T = StoreSitesEnum.BlockType;
  const uses = (...types: StoreSitesEnum.BlockType[]): boolean =>
    types.includes(type);
  const height: unknown = source.height;

  return {
    align: uses(T.TEXT, T.BUTTONS, T.IMAGE, T.BOX, T.TABS)
      ? (oneOf(source.align, Object.values(StoreSitesEnum.SectionAlign)) ??
        StoreSitesEnum.SectionAlign.CENTER)
      : null,
    width: uses(T.IMAGE, T.VIDEO, T.BOX)
      ? (oneOf(source.width, Object.values(StoreSitesEnum.SectionWidth)) ??
        StoreSitesEnum.SectionWidth.WIDE)
      : null,
    tone: uses(T.TEXT, T.BOX, T.TABS)
      ? (oneOf(source.tone, Object.values(StoreSitesEnum.SectionTone)) ??
        StoreSitesEnum.SectionTone.NONE)
      : null,
    height: uses(T.SPACER)
      ? typeof height === "number" && Number.isFinite(height)
        ? Math.min(
            SPACER_LIMITS.max,
            Math.max(SPACER_LIMITS.min, Math.round(height)),
          )
        : SPACER_LIMITS.initial
      : null,
    divider: uses(T.DIVIDER)
      ? (oneOf(source.divider, Object.values(StoreSitesEnum.DividerStyle)) ??
        StoreSitesEnum.DividerStyle.LINE)
      : null,
    media: uses(T.VIDEO)
      ? mediaOf(source.media)
      : uses(T.ABOUT) && source.isOwn === true
        ? siteAboutOf({ media: source.media as IStoreSiteAboutMedia }).media
        : null,
    menuStyle: uses(T.TABS)
      ? (oneOf(source.menuStyle, Object.values(StoreSitesEnum.MenuStyle)) ??
        StoreSitesEnum.MenuStyle.TABS)
      : null,
    menuMode: uses(T.TABS)
      ? (oneOf(source.menuMode, Object.values(StoreSitesEnum.MenuMode)) ??
        StoreSitesEnum.MenuMode.SWITCH)
      : null,
    menuSide: uses(T.TABS)
      ? (oneOf(source.menuSide, Object.values(StoreSitesEnum.MenuSide)) ??
        StoreSitesEnum.MenuSide.LEFT)
      : null,
    menuLook: uses(T.TABS)
      ? (oneOf(source.menuLook, Object.values(StoreSitesEnum.MenuLook)) ??
        StoreSitesEnum.MenuLook.PILL)
      : null,
    menuEffect: uses(T.TABS)
      ? (oneOf(source.menuEffect, Object.values(StoreSitesEnum.MenuEffect)) ??
        StoreSitesEnum.MenuEffect.SLIDE)
      : null,
    menuPlace: uses(T.TABS)
      ? (oneOf(source.menuPlace, Object.values(StoreSitesEnum.MenuPlace)) ??
        StoreSitesEnum.MenuPlace.FIXED)
      : null,
    isOwn: uses(T.MARQUEE, T.CARDS, T.ABOUT) ? source.isOwn === true : null,
    mediaPosition: uses(T.ABOUT)
      ? (oneOf(
          source.mediaPosition,
          Object.values(StoreSitesEnum.AboutMediaPosition),
        ) ?? StoreSitesEnum.AboutMediaPosition.LEFT)
      : null,
    marquee:
      uses(T.MARQUEE) && source.isOwn === true
        ? siteMarqueeStyleOf(
            source.marquee as Partial<IStoreSiteMarqueeStyle> | null,
          )
        : null,
    // The template draws the cards the site had before any of their own.
    cards:
      uses(T.CARDS) && source.isOwn === true
        ? siteCardsStyleOf(source.cards as Partial<IStoreSiteCardsStyle> | null)
        : null,
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
        subtitle: textOf(
          source.subtitle,
          type === StoreSitesEnum.BlockType.TEXT
            ? BLOCK_LIMITS.textBody
            : BLOCK_LIMITS.subtitle,
        ),
        items:
          !WITH_ITEMS.includes(type) || !Array.isArray(source.items)
            ? []
            : source.items
                .map((item: unknown) => itemOf(type, item))
                .slice(0, maxItemsOf(type)),
        // A button the API left out (it went nowhere safe) stays out.
        button:
          type === StoreSitesEnum.BlockType.CTA && source.button
            ? buttonOf(source.button)
            : null,
        buttons:
          type === StoreSitesEnum.BlockType.BUTTONS &&
          Array.isArray(source.buttons)
            ? source.buttons.slice(0, MAX_SECTION_BUTTONS).map(buttonOf)
            : [],
        settings: blockSettingsOf(type, source.settings),
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
    .map(showableSection)
    .filter((block: IStoreSiteBlock | null) => !!block) as IStoreSiteBlock[];

/**
 * A section as visitors see it: only the items and buttons it can show, or
 * null when nothing is left. A part always stays (its own tab decides).
 */
export const showableSection = (
  block: IStoreSiteBlock,
): IStoreSiteBlock | null => {
  const T = StoreSitesEnum.BlockType;

  if (isPartType(block.type)) {
    return block;
  }

  const shown: IStoreSiteBlock = {
    ...block,
    items: block.items.filter((item: IStoreSiteBlockItem) =>
      isUsableItem(block.type, item),
    ),
  };

  switch (block.type) {
    case T.CTA:
      return block.title ? shown : null;
    case T.TEXT:
      return block.title || block.subtitle ? shown : null;
    case T.BUTTONS:
      return block.buttons.length ? shown : null;
    case T.VIDEO:
      return block.settings.media ? shown : null;
    case T.SPACER:
    case T.DIVIDER:
      return shown;
    default:
      return shown.items.length ? shown : null;
  }
};

type TTranslate = (key: string) => string;

const SAMPLE_ITEMS: Partial<Record<StoreSitesEnum.BlockType, number>> = {
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
const SAMPLE_FIELDS: Partial<
  Record<StoreSitesEnum.BlockType, ("title" | "subtitle" | "text")[]>
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
    items: Array.from(
      { length: SAMPLE_ITEMS[type] ?? 0 },
      (_, index: number) => {
        const item: IStoreSiteBlockItem = newBlockItem(type);

        (SAMPLE_FIELDS[type] ?? []).forEach((field) => {
          item[field] = t(`${base}.items.${index}.${field}`);
        });

        if (type === StoreSitesEnum.BlockType.FEATURES) {
          item.icon = SAMPLE_ICONS[index % SAMPLE_ICONS.length];
        }

        return item;
      },
    ),
    button:
      type === StoreSitesEnum.BlockType.CTA
        ? newBlockButton({ label: t(`${base}.button`) })
        : null,
    buttons: [],
    settings: blockSettingsOf(type, {}),
  };
};

/** A button as the API keeps it, whatever was stored or typed. */
export const blockButtonOf = (raw: unknown): IStoreSiteBlockButton =>
  buttonOf(raw);
