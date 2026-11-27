import StoreSitesEnum from "./store-sites.enum";

export interface IStoreSiteFooterLink {
  key: string;
  type: StoreSitesEnum.FooterLinkType;
  /** What the link says; empty, the site names it by its kind. */
  label: string;
  url: string;
  /** The key of the section of the footer it is shown in. */
  section: string;
  /** A logo or an image: the key of an uploaded picture. */
  imageUrl?: string | null;
  /** A logo or an image: its height in pixels. */
  height?: number | null;
}

/** How tall a logo or an image of the footer can be, in pixels. */
export const FOOTER_IMAGE_HEIGHT_RANGE: [number, number] = [20, 240];

/** Whether a kind of item is not a link: the footer shows it as it is. */
export const isFooterContent = (type: StoreSitesEnum.FooterLinkType): boolean =>
  StoreSitesEnum.FOOTER_CONTENT_TYPES.includes(type);

/** A new item of a kind, empty, for a section. */
export const newFooterItem = (
  type: StoreSitesEnum.FooterLinkType,
  section: string,
): IStoreSiteFooterLink => ({
  key: `l-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
  type,
  label: "",
  url: "",
  section,
  imageUrl: null,
  height:
    type === StoreSitesEnum.FooterLinkType.LOGO
      ? 48
      : type === StoreSitesEnum.FooterLinkType.IMAGE
        ? 80
        : null,
});

/** One column of the footer, with an optional title above what is in it. */
export interface IStoreSiteFooterSection {
  key: string;
  title: string | null;
}

/**
 * The foot of the site: a few words, as many links as the owner wants (social
 * networks, other sites, ways to get in touch) and the way into the app.
 */
export interface IStoreSiteFooter {
  isActive: boolean;
  text: string | null;
  /** The button that takes a customer to the login of the app. */
  isLoginVisible: boolean;
  /** A logo above the name, in the same column. */
  isLogoVisible: boolean;
  /** The footer's own logo; empty, the logo of the site. */
  logoUrl: string | null;
  /** Its height in pixels, 20 to 160. */
  logoHeight: number;
  /** The columns of the footer, left to right: one to five. */
  sections: IStoreSiteFooterSection[];
  /** The section the name and the text are in. */
  textSection: string;
  /** The section the login button is in. */
  loginSection: string;
  /**
   * Everything the footer shows, in order: links, and the name, the logo,
   * paragraphs, pictures and the way into the app, each in its section.
   */
  links: IStoreSiteFooterLink[];
  /**
   * 2 once the name, the logo, the text and the sign-in are items of `links`;
   * an older footer has them in its own fields, and is read into items.
   */
  itemsVersion?: number;
}

/**
 * How the footer was before it had sections: the words on one side, the links
 * on the other. A site that never chose its sections keeps looking like that.
 */
export const DEFAULT_FOOTER_SECTIONS: IStoreSiteFooterSection[] = [
  { key: "main", title: null },
  { key: "links", title: null },
];

export const DEFAULT_SITE_FOOTER: IStoreSiteFooter = {
  isActive: true,
  text: null,
  isLoginVisible: true,
  isLogoVisible: false,
  logoUrl: null,
  logoHeight: 48,
  sections: DEFAULT_FOOTER_SECTIONS.map((section) => ({ ...section })),
  textSection: "main",
  loginSection: "main",
  links: [],
};

/**
 * What a footer saved before its items had kinds showed from its own fields,
 * as items: the logo, the name and the text where the text was, and the
 * sign-in where it was. The same reading the API does.
 */
const legacyItemsOf = (
  footer: Partial<IStoreSiteFooter> | null | undefined,
  textSection: string,
  loginSection: string,
): { before: IStoreSiteFooterLink[]; after: IStoreSiteFooterLink[] } => {
  const F = StoreSitesEnum.FooterLinkType;

  const item = (
    key: string,
    type: StoreSitesEnum.FooterLinkType,
    section: string,
    patch: Partial<IStoreSiteFooterLink> = {},
  ): IStoreSiteFooterLink => ({
    key,
    type,
    label: "",
    url: "",
    section,
    imageUrl: null,
    height: null,
    ...patch,
  });

  const text: string = footer?.text?.trim() ?? "";

  return {
    before: [
      ...(footer?.isLogoVisible === true
        ? [
            item("legacy-logo", F.LOGO, textSection, {
              imageUrl: footer.logoUrl?.trim() || null,
              height:
                typeof footer.logoHeight === "number" ? footer.logoHeight : 48,
            }),
          ]
        : []),
      item("legacy-name", F.NAME, textSection),
      ...(text
        ? [item("legacy-note", F.NOTE, textSection, { label: text })]
        : []),
    ],
    after:
      footer?.isLoginVisible !== false
        ? [item("legacy-sign-in", F.SIGN_IN, loginSection)]
        : [],
  };
};

const ALLOWED_PROTOCOLS: string[] = ["http:", "https:", "mailto:", "tel:"];

/**
 * Whether an address may be put in a link of the page. The API already checks
 * what it stores; this is the same rule at the last moment, for the preview
 * (which draws a draft the API never saw) and for anything stored before.
 */
export const isSafeFooterUrl = (url: string | null | undefined): boolean => {
  try {
    return !!url && ALLOWED_PROTOCOLS.includes(new URL(url.trim()).protocol);
  } catch {
    return false;
  }
};

/**
 * The footer of a site, also for one saved before the footer or its sections
 * existed. Whatever points to a section that is gone falls back to one that is
 * there, instead of vanishing from the page.
 */
export const siteFooterOf = (
  footer: Partial<IStoreSiteFooter> | null | undefined,
): IStoreSiteFooter => {
  const ownSections: IStoreSiteFooterSection[] = (
    footer?.sections && Array.isArray(footer.sections) ? footer.sections : []
  )
    .filter(
      (section: IStoreSiteFooterSection) =>
        !!section && typeof section.key === "string" && !!section.key,
    )
    .slice(0, StoreSitesEnum.MAX_FOOTER_SECTIONS);

  const sections: IStoreSiteFooterSection[] = ownSections.length
    ? ownSections
    : DEFAULT_FOOTER_SECTIONS.map((section) => ({ ...section }));

  const first: string = sections[0].key;

  const linksSection: string = ownSections.length
    ? first
    : (sections[1]?.key ?? first);

  const placeOf = (section: unknown, fallback: string): string =>
    typeof section === "string" &&
    sections.some((known: IStoreSiteFooterSection) => known.key === section)
      ? section
      : fallback;

  const textSection: string = placeOf(footer?.textSection, first);
  const loginSection: string = placeOf(footer?.loginSection, first);

  const own: IStoreSiteFooterLink[] = (
    footer?.links && Array.isArray(footer.links) ? footer.links : []
  )
    .filter(
      (link: IStoreSiteFooterLink) => !!link && typeof link.type === "string",
    )
    .map((link: IStoreSiteFooterLink) => ({
      ...link,
      label: link.label ?? "",
      url: link.url ?? "",
      imageUrl: link.imageUrl ?? null,
      height: typeof link.height === "number" ? link.height : null,
      section: placeOf(link.section, linksSection),
    }));

  const legacy =
    footer?.itemsVersion === 2
      ? { before: [], after: [] }
      : legacyItemsOf(footer, textSection, loginSection);

  return {
    isActive: footer?.isActive !== false,
    // Read into items: the footer shows only its items.
    text: null,
    isLoginVisible: false,
    isLogoVisible: false,
    logoUrl: null,
    logoHeight: 48,
    sections,
    textSection,
    loginSection,
    links: [...legacy.before, ...own, ...legacy.after],
    itemsVersion: 2,
  };
};

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toPhone = (value: string): string | null => {
  const digits: string = value.replace(/[^\d]/g, "");

  if (digits.length < 8 || digits.length > 15 || /[a-z]/i.test(value)) {
    return null;
  }

  return value.trim().startsWith("+") ? `+${digits}` : digits;
};

/**
 * What was typed, completed the way a person means it (a number becomes a call
 * or a chat, an address gets its "https://"), or null when it is not an
 * address the site may link to. The same rule the API applies when saving.
 */
export const completeFooterUrl = (
  type: StoreSitesEnum.FooterLinkType,
  typedUrl: string,
): string | null => {
  const typed: string = typedUrl.trim();

  if (!typed || typed.length > 300) {
    return null;
  }

  let candidate: string = typed;

  if (!HAS_SCHEME.test(typed)) {
    if (type === StoreSitesEnum.FooterLinkType.EMAIL) {
      return EMAIL.test(typed) ? `mailto:${typed.toLowerCase()}` : null;
    }

    if (type === StoreSitesEnum.FooterLinkType.PHONE) {
      const phone: string | null = toPhone(typed);

      return phone ? `tel:${phone}` : null;
    }

    const whatsapp: string | null =
      type === StoreSitesEnum.FooterLinkType.WHATSAPP ? toPhone(typed) : null;

    candidate = whatsapp
      ? `https://wa.me/${whatsapp.replace("+", "")}`
      : `https://${typed}`;
  }

  try {
    const url: URL = new URL(candidate);

    const isWeb: boolean =
      url.protocol === "http:" || url.protocol === "https:";

    return ALLOWED_PROTOCOLS.includes(url.protocol) &&
      (!isWeb || url.hostname.includes("."))
      ? candidate
      : null;
  } catch {
    return null;
  }
};
