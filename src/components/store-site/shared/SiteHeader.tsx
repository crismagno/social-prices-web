"use client";

import {
  CSSProperties,
  Fragment,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  IStoreSiteBlock,
  siteBlocksOf,
} from "../../../shared/business/store-sites/store-site-blocks";
import {
  HEADER_SLOT_ALIGNS,
  headerButtonIndex,
  siteHeaderOf,
} from "../../../shared/business/store-sites/store-site-header";
import {
  IStoreSitePage,
  sitePagePath,
} from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { IPublicSiteStore } from "../../../shared/business/store-sites/store-sites.types";
import { ISiteCartApi, IStoreSiteTemplateProps } from "../template.types";
import { siteHasAbout } from "./SiteAbout";
import SiteButton from "./blocks/SiteButton";
import SiteCartButton from "./SiteCartButton";
import styles from "./SiteHeader.module.css";
import SiteMenu from "./SiteMenu";
import SiteSignIn from "./SiteSignIn";
import { getSiteContent } from "./useSiteContent";

interface Props {
  site: IStoreSiteTemplateProps["site"];
  store: IPublicSiteStore;
  cart: ISiteCartApi;
  page: IStoreSitePage | null;
}

// How far the page moves before the header closes, and how closed it gets.
const SCROLLED_AFTER: number = 8;
const SCROLLED_ALPHA: number = 96;

/** Pixels of air between a clean header and the words of the entrance. */
const OVER_GAP: number = 20;

/**
 * The header of the site: its name, its menu, the sign-in and the cart. It is
 * the site's, not a page's: the same on every page, apart from the entrance,
 * at the side of the screen the owner chose (top, bottom, left or right). At
 * the top it scrolls away with the page unless the owner keeps it on screen;
 * anywhere else it is always there. On a phone a side header becomes a top one.
 */
const SiteHeader = ({ site, store, cart, page }: Props) => {
  const {
    position,
    style,
    isFixed,
    order,
    transparency,
    shadow,
    border,
    home,
    color,
    background,
    height,
    width,
    buttons,
    actionsOrder,
    buttonSize,
    aligns,
  } = siteHeaderOf(site.header);

  // Where each place puts its part: as the owner said, else as the place does.
  const alignOf = (slot: number): StoreSitesEnum.HeaderAlign =>
    aligns[order[slot]] ?? HEADER_SLOT_ALIGNS[slot];
  const { logo, brandName } = getSiteContent({ site, store });

  const ref = useRef<HTMLElement>(null);

  // Once the page has moved under it, the header closes its background: what
  // passes behind a see-through one makes its words hard to read.
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const read = (): void => setIsScrolled(window.scrollY > SCROLLED_AFTER);

    read();
    window.addEventListener("scroll", read, { passive: true });

    return () => window.removeEventListener("scroll", read);
  }, []);

  // Whatever sticks to the screen (a menu of tabs, the chat button) keeps
  // clear of the header while it is there.
  useEffect(() => {
    const root: HTMLElement = document.documentElement;
    const P = StoreSitesEnum.HeaderPosition;

    const measure = (): void => {
      const height: number = ref.current?.offsetHeight ?? 0;
      const isSide: boolean = position === P.LEFT || position === P.RIGHT;
      // A side header is a top one on a narrow screen.
      const isOnTop: boolean =
        position === P.TOP || (isSide && window.innerWidth < 900);
      const isStuck: boolean = isSide || isFixed;

      root.style.setProperty(
        "--site-sticky-top",
        isOnTop && isStuck ? `${height}px` : "0px",
      );
      // A clean header at the top lies over the page: the entrance starts
      // its words below it, so none of them ends up behind the menu.
      root.style.setProperty(
        "--site-header-over",
        position === P.TOP && transparency > 0
          ? `${height + OVER_GAP}px`
          : "0px",
      );
      root.style.setProperty(
        "--site-bottom-bar",
        position === P.BOTTOM ? `${height}px` : "0px",
      );
    };

    measure();
    window.addEventListener("resize", measure);

    // The page beside a side header leaves it the room it takes.
    if (width) {
      root.style.setProperty("--site-header-side", `${width}px`);
    }

    return () => {
      window.removeEventListener("resize", measure);
      root.style.removeProperty("--site-sticky-top");
      root.style.removeProperty("--site-bottom-bar");
      root.style.removeProperty("--site-header-over");
      root.style.removeProperty("--site-header-side");
    };
  }, [position, isFixed, height, width, transparency]);

  // One button of the header: the sign-in, the cart or one of the owner's own
  // (one that says nothing or goes nowhere safe is not drawn).
  const action = (token: string): ReactNode => {
    if (token === StoreSitesEnum.HeaderAction.SIGN_IN) {
      return (
        site.signIn?.isVisible !== false && (
          <SiteSignIn
            signIn={site.signIn}
            storeId={site.storeId}
            className={styles.signIn}
            isCompact
          />
        )
      );
    }

    if (token === StoreSitesEnum.HeaderAction.CART) {
      return (
        <SiteCartButton
          settings={site.cartButton}
          cart={cart}
          className={styles.cart}
          defaultLabelKey="storeSite.public.cart"
          countFormat="badge"
        />
      );
    }

    return (
      <SiteButton
        button={buttons[headerButtonIndex(token)] ?? null}
        context={{ siteSlug: site.slug, pages: site.pages, mode: "live" }}
        className={styles.button}
        hasNoDefaultLabel
      />
    );
  };

  // The three parts of the header; the owner chose where each one goes.
  const parts: Record<StoreSitesEnum.HeaderPart, ReactNode> = {
    [StoreSitesEnum.HeaderPart.BRAND]: (
      <a href={sitePagePath(site.slug)} className={styles.brand}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {logo && <img src={logo} alt="" />}
        {/* Emptied by the owner: the header shows no name, only the logo. */}
        {site.displayName !== "" && <span>{brandName}</span>}
      </a>
    ),
    [StoreSitesEnum.HeaderPart.MENU]: (
      <span className={styles.links}>
        <SiteMenu
          pages={site.pages}
          siteSlug={site.slug}
          currentKey={page?.key}
          home={home}
          hasAbout={
            siteHasAbout(site.about, store.about) ||
            // A text with media of its own, wherever the owner put it.
            siteBlocksOf(site.blocks).some(
              (block: IStoreSiteBlock) =>
                block.type === StoreSitesEnum.BlockType.ABOUT &&
                block.settings.isOwn === true &&
                block.isActive,
            )
          }
        />
      </span>
    ),
    [StoreSitesEnum.HeaderPart.ACTIONS]: (
      <span className={styles.end}>
        {actionsOrder.map((token: string) => (
          <Fragment key={token}>{action(token)}</Fragment>
        ))}
      </span>
    ),
  };

  return (
    <header
      ref={ref}
      className={styles.header}
      data-site-header={position}
      data-style={style}
      data-fixed={isFixed || undefined}
      data-clean={transparency > 0 || undefined}
      data-scrolled={isScrolled || undefined}
      data-shadow={shadow === null ? undefined : ""}
      data-border={border ? "" : undefined}
      data-button-size={buttonSize}
      style={
        {
          ...(color ? { color } : {}),
          // Its own background, a little see-through like the site's.
          ...(background ? { "--site-header-bg": background } : {}),
          // How much of the background is left.
          "--site-header-alpha": `${100 - transparency}%`,
          // And how much once the page is rolling under it: never less.
          "--site-header-alpha-scrolled": `${Math.max(
            100 - transparency,
            SCROLLED_ALPHA,
          )}%`,
          ...(height ? { "--site-header-h": `${height}px` } : {}),
          // Its border, when the owner chose one: none is one too.
          ...(border
            ? {
                "--site-header-border":
                  border.style === StoreSitesEnum.BorderStyle.NONE
                    ? "0 none transparent"
                    : `${border.width}px ${border.style.toLowerCase()} ${
                        border.color ?? "var(--site-text)"
                      }`,
              }
            : {}),
          // The strength of its shadow, when the owner chose one.
          ...(shadow === null ? {} : { "--site-header-shadow": shadow / 100 }),
        } as CSSProperties
      }
    >
      <nav
        className={styles.inner}
        // A middle part pushed to a side takes the room between the others.
        data-middle={
          alignOf(1) === StoreSitesEnum.HeaderAlign.CENTER ? undefined : "wide"
        }
      >
        {order.map((part: StoreSitesEnum.HeaderPart, slot: number) => (
          <span
            key={part}
            className={styles.slot}
            data-slot={slot}
            data-align={alignOf(slot)}
          >
            {parts[part]}
          </span>
        ))}
      </nav>
    </header>
  );
};

export default SiteHeader;
