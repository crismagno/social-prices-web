import StoreSitesEnum from "./store-sites.enum";

export interface IStoreSiteAboutMedia {
  type: StoreSitesEnum.AboutMediaType;
  /** The key of an uploaded file, or the player address of a video link. */
  url: string;
}

/**
 * The "about" of the site: a title, as many paragraphs as the owner writes and
 * an image or a video. Empty, it falls back to the store's own description.
 */
export interface IStoreSiteAbout {
  isActive: boolean;
  title: string | null;
  texts: string[];
  media: IStoreSiteAboutMedia | null;
  mediaPosition: StoreSitesEnum.AboutMediaPosition;
}

/** The about section of a site, also for one saved before it existed. */
export const siteAboutOf = (
  about: Partial<IStoreSiteAbout> | null | undefined,
): IStoreSiteAbout => ({
  isActive: about?.isActive !== false,
  title: about?.title?.trim() || null,
  texts: (about?.texts && Array.isArray(about.texts) ? about.texts : [])
    .filter((text: string) => typeof text === "string")
    .slice(0, StoreSitesEnum.MAX_ABOUT_TEXTS),
  media:
    about?.media &&
    typeof about.media.url === "string" &&
    about.media.url.trim() &&
    Object.values(StoreSitesEnum.AboutMediaType).includes(about.media.type)
      ? about.media
      : null,
  mediaPosition: Object.values(StoreSitesEnum.AboutMediaPosition).includes(
    about?.mediaPosition as StoreSitesEnum.AboutMediaPosition,
  )
    ? (about?.mediaPosition as StoreSitesEnum.AboutMediaPosition)
    : StoreSitesEnum.AboutMediaPosition.LEFT,
});

const YOUTUBE_HOSTS: string[] = [
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtube-nocookie.com",
];
const VIMEO_HOSTS: string[] = [
  "vimeo.com",
  "www.vimeo.com",
  "player.vimeo.com",
];

/**
 * The player of a YouTube or Vimeo video, from the link the owner pasted, or
 * null for anything else. The same rule the API applies when saving.
 */
export const embedUrlOf = (link: string | null | undefined): string | null => {
  const typed: string = link?.trim() ?? "";

  if (!typed || typed.length > 600) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(
      /^[a-z][a-z0-9+.-]*:/i.test(typed) ? typed : `https://${typed}`,
    );
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null;
  }

  const host: string = url.hostname.toLowerCase();
  const parts: string[] = url.pathname.split("/").filter(Boolean);

  if (YOUTUBE_HOSTS.includes(host)) {
    const id: string | null =
      host === "youtu.be"
        ? parts[0]
        : ["embed", "shorts", "live"].includes(parts[0])
          ? parts[1]
          : url.searchParams.get("v");

    return id && /^[A-Za-z0-9_-]{11}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : null;
  }

  if (VIMEO_HOSTS.includes(host)) {
    const id: string | undefined =
      host === "player.vimeo.com" ? parts[1] : parts[0];

    return id && /^\d{1,12}$/.test(id)
      ? `https://player.vimeo.com/video/${id}`
      : null;
  }

  return null;
};

/** Whether an address is the player of a video this site embeds. */
export const isKnownPlayer = (url: string | null | undefined): boolean =>
  !!url &&
  (url.startsWith("https://www.youtube-nocookie.com/embed/") ||
    url.startsWith("https://player.vimeo.com/video/"));
