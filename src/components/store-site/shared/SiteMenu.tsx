"use client";

import { useEffect, useState } from "react";

import { CloseOutlined, MenuOutlined } from "@ant-design/icons";

import {
  IStoreSitePage,
  sitePagePath,
  sitePagesOf,
} from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import styles from "./SiteMenu.module.css";
import useSiteT from "./useSiteT";

interface Props {
  pages: IStoreSitePage[] | null | undefined;
  siteSlug: string;
  /** The page shown, to mark it in the menu; none is the home. */
  currentKey?: string | null;
  /** Whether the site has an about to show: its page leaves the menu if not. */
  hasAbout: boolean;
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
const SiteMenu = ({ pages, siteSlug, currentKey, hasAbout }: Props) => {
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

  const items: IStoreSitePage[] = sitePagesOf(pages).filter(
    (page: IStoreSitePage) =>
      page.isInMenu &&
      // An about page with nothing to say stays out of the menu.
      (page.type !== StoreSitesEnum.SitePageType.ABOUT || hasAbout),
  );

  const link = (page: IStoreSitePage, className: string, extra = {}) => (
    <a
      key={page.key}
      href={sitePagePath(siteSlug, page.slug)}
      className={className}
      aria-current={page.key === currentKey ? "page" : undefined}
      {...extra}
    >
      {labelOf(page)}
    </a>
  );

  return (
    <>
      {items.map((page: IStoreSitePage) =>
        link(page, styles.link, { "data-navlink": "" }),
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
          <a href={sitePagePath(siteSlug)} className={styles.panelLink}>
            {t("storeSite.pages.home")}
          </a>
          {items.map((page: IStoreSitePage) => link(page, styles.panelLink))}
        </nav>
      )}
    </>
  );
};

export default SiteMenu;
