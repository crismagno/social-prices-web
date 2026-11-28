"use client";

import { useEffect, useState } from "react";

import { CloseOutlined, MenuOutlined } from "@ant-design/icons";

import {
  IStoreSitePage,
  sitePagePath,
  sitePagesOf,
} from "../../../shared/business/store-sites/store-site-pages";
import { IStoreSiteHeaderHome } from "../../../shared/business/store-sites/store-site-header";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import FeatureIcon from "./blocks/FeatureIcon";
import styles from "./SiteMenu.module.css";
import useSiteT from "./useSiteT";

interface Props {
  pages: IStoreSitePage[] | null | undefined;
  siteSlug: string;
  /** The page shown, to mark it in the menu; none is the home. */
  currentKey?: string | null;
  /** Whether the site has an about to show: its page leaves the menu if not. */
  hasAbout: boolean;
  /** The link to the first page: whether it is there, and its own words. */
  home?: IStoreSiteHeaderHome | null;
}

/** The name of a page in the menu: the owner's, else its kind's. */
export const usePageLabel = (): ((page: IStoreSitePage) => string) => {
  const t = useSiteT();

  return (page: IStoreSitePage): string =>
    page.label?.trim() ||
    page.title?.trim() ||
    (page.type === StoreSitesEnum.SitePageType.CUSTOM
      ? page.slug
      : t(`storeSite.pages.types.${page.type}`));
};

/**
 * The top menu of the site: one link per page the owner put in it, in the
 * order chosen. On a phone it folds into a button that opens a panel.
 */
const SiteMenu = ({ pages, siteSlug, currentKey, hasAbout, home }: Props) => {
  const t = useSiteT();
  const labelOf = usePageLabel();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const close = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", close);

    return () => window.removeEventListener("keydown", close);
  }, [isOpen]);

  // The pages the owner put in the menu, in their order.
  const inMenu: IStoreSitePage[] = sitePagesOf(pages).filter(
    (page: IStoreSitePage) => page.isInMenu,
  );

  // An about page with nothing to say stays out of the menu.
  const isShown = (page: IStoreSitePage): boolean =>
    page.type !== StoreSitesEnum.SitePageType.ABOUT || hasAbout;

  const items: IStoreSitePage[] = inMenu.filter(isShown);

  // The way back to the first page: there unless the owner hid it.
  const hasHome: boolean = home?.isInMenu !== false;
  const homeLabel: string = home?.label?.trim() || t("storeSite.pages.home");

  // The menu in order: the home (told apart as "no page") where the owner
  // put it among the pages. Counted with every page of the menu, shown or
  // not, so it keeps its place when one of them has nothing to show.
  const entries: (IStoreSitePage | null)[] = [...inMenu];

  if (hasHome) {
    entries.splice(Math.min(home?.position ?? 0, inMenu.length), 0, null);
  }

  const shownEntries: (IStoreSitePage | null)[] = entries.filter(
    (entry: IStoreSitePage | null) => entry === null || isShown(entry),
  );

  const homeLink = (className: string, extra = {}) => (
    <a
      key="home"
      href={sitePagePath(siteSlug)}
      className={className}
      aria-current={currentKey ? undefined : "page"}
      {...extra}
    >
      {homeLabel}
    </a>
  );

  const link = (page: IStoreSitePage, className: string, extra = {}) => (
    <a
      key={page.key}
      href={sitePagePath(siteSlug, page.slug)}
      className={className}
      aria-current={page.key === currentKey ? "page" : undefined}
      {...extra}
    >
      {page.icon && (
        <span className={styles.icon} aria-hidden="true">
          <FeatureIcon icon={page.icon} />
        </span>
      )}
      {labelOf(page)}
    </a>
  );

  return (
    <>
      {items.length > 0 &&
        shownEntries.map((entry: IStoreSitePage | null) =>
          entry
            ? link(entry, styles.link, { "data-navlink": "" })
            : homeLink(styles.link, { "data-navlink": "" }),
        )}

      {items.length > 0 && (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={isOpen}
          aria-label={
            isOpen
              ? t("storeSite.pages.closeMenu")
              : t("storeSite.pages.openMenu")
          }
          onClick={() => setIsOpen((open: boolean) => !open)}
        >
          {isOpen ? <CloseOutlined /> : <MenuOutlined />}
        </button>
      )}

      {isOpen && (
        <nav className={styles.panel} aria-label={t("storeSite.pages.menu")}>
          {shownEntries.map((entry: IStoreSitePage | null) =>
            entry ? link(entry, styles.panelLink) : homeLink(styles.panelLink),
          )}
        </nav>
      )}
    </>
  );
};

export default SiteMenu;
