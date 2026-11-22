import StoreSitesEnum from "./store-sites.enum";

export interface IStoreSiteFooterLink {
  key: string;
  type: StoreSitesEnum.FooterLinkType;
  /** What the link says; empty, the site names it by its kind. */
  label: string;
  url: string;
  /** The key of the section of the footer it is shown in. */
  section: string;
}

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
  /** The columns of the footer, left to right: one to five. */
  sections: IStoreSiteFooterSection[];
  /** The section the name and the text are in. */
  textSection: string;
  /** The section the login button is in. */
  loginSection: string;
  links: IStoreSiteFooterLink[];
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
  sections: DEFAULT_FOOTER_SECTIONS.map((section) => ({ ...section })),
  textSection: "main",
  loginSection: "main",
  links: [],
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

  return {
    isActive: footer?.isActive !== false,
    text: footer?.text?.trim() || null,
    isLoginVisible: footer?.isLoginVisible !== false,
    sections,
    textSection: placeOf(footer?.textSection, first),
    loginSection: placeOf(footer?.loginSection, first),
    links: (footer?.links && Array.isArray(footer.links) ? footer.links : [])
      .filter(
        (link: IStoreSiteFooterLink) => !!link && typeof link.url === "string",
      )
      .map((link: IStoreSiteFooterLink) => ({
        ...link,
        section: placeOf(link.section, linksSection),
      })),
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
