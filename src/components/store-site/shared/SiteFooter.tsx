"use client";

import { CSSProperties, Fragment, ReactNode } from "react";

import {
  FacebookOutlined,
  GlobalOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  MailOutlined,
  PhoneOutlined,
  PinterestOutlined,
  SendOutlined,
  TikTokOutlined,
  TwitterOutlined,
  WhatsAppOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";

import {
  isFooterContent,
  isSafeFooterUrl,
  IStoreSiteFooter,
  IStoreSiteFooterLink,
  IStoreSiteFooterSection,
  siteFooterOf,
} from "../../../shared/business/store-sites/store-site-footer";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { IStoreSiteSignIn } from "../../../shared/business/store-sites/store-site-sign-in";
import { getImageUrl } from "../../../shared/utils/images/images-url";
import { TSiteAboutVariant } from "./SiteAbout";
import styles from "./SiteFooter.module.css";
import SiteSignIn from "./SiteSignIn";
import useReveal from "./useReveal";
import useSiteT from "./useSiteT";

interface Props {
  footer: Partial<IStoreSiteFooter> | null | undefined;
  /** The name at the top of the site, repeated here. */
  brandName: string;
  /** The sign-in button of the site: the footer's says and goes the same. */
  signIn?: Partial<IStoreSiteSignIn> | null;
  storeId?: string | null;
  /** The logo of the site: the footer's own when it has none. */
  siteLogo?: string | null;
  /** The template: the logo takes the shape it has at the top of the site. */
  variant?: TSiteAboutVariant;
}

// A link of free text has no icon: it is just the owner's words.
const ICONS: Partial<Record<StoreSitesEnum.FooterLinkType, ReactNode>> = {
  [StoreSitesEnum.FooterLinkType.INSTAGRAM]: <InstagramOutlined />,
  [StoreSitesEnum.FooterLinkType.FACEBOOK]: <FacebookOutlined />,
  [StoreSitesEnum.FooterLinkType.WHATSAPP]: <WhatsAppOutlined />,
  [StoreSitesEnum.FooterLinkType.TIKTOK]: <TikTokOutlined />,
  [StoreSitesEnum.FooterLinkType.YOUTUBE]: <YoutubeOutlined />,
  [StoreSitesEnum.FooterLinkType.X]: <TwitterOutlined />,
  [StoreSitesEnum.FooterLinkType.LINKEDIN]: <LinkedinOutlined />,
  [StoreSitesEnum.FooterLinkType.PINTEREST]: <PinterestOutlined />,
  [StoreSitesEnum.FooterLinkType.TELEGRAM]: <SendOutlined />,
  [StoreSitesEnum.FooterLinkType.EMAIL]: <MailOutlined />,
  [StoreSitesEnum.FooterLinkType.PHONE]: <PhoneOutlined />,
  [StoreSitesEnum.FooterLinkType.WEBSITE]: <GlobalOutlined />,
  [StoreSitesEnum.FooterLinkType.TEXT]: null,
};

/** One link of the footer: a pill with its icon, or plain free text. */
export const SiteFooterLink = ({ link }: { link: IStoreSiteFooterLink }) => {
  const t = useSiteT();

  const isWeb: boolean = /^https?:/i.test(link.url);

  const isText: boolean = link.type === StoreSitesEnum.FooterLinkType.TEXT;

  return (
    <li key={link.key}>
      <a
        href={link.url}
        className={isText ? styles.plainLink : styles.link}
        // A link out of the site opens beside it and tells the other side
        // nothing about where the visitor came from.
        {...(isWeb
          ? { target: "_blank", rel: "noopener noreferrer nofollow" }
          : {})}
      >
        {!isText && (ICONS[link.type] ?? <GlobalOutlined />)}
        <span className={styles.linkLabel}>
          {link.label?.trim() ||
            (isText
              ? // No words were given: the address says where it goes.
                link.url.replace(/^(https?:\/\/|mailto:|tel:)/i, "")
              : t(`storeSite.footer.types.${link.type}`))}
        </span>
      </a>
    </li>
  );
};

/**
 * The foot of the site, the same in every template. The owner divides it in
 * one to five sections, side by side, and says in which one each thing goes:
 * the name with its words, the way into the app, and each link.
 */
const SiteFooter = ({
  footer,
  brandName,
  signIn,
  storeId,
  siteLogo,
  variant,
}: Props) => {
  // Its columns come in one after the other as it scrolls into view.
  const { ref, phase } = useReveal<HTMLElement>();

  const t = useSiteT();

  const { isActive, sections, links } = siteFooterOf(footer);

  const year: number = new Date().getFullYear();

  const F = StoreSitesEnum.FooterLinkType;

  /** A logo: the item's own picture, else the logo of the site; none, nothing. */
  const logoOf = (item: IStoreSiteFooterLink): ReactNode => {
    const source: string | null = item.imageUrl
      ? getImageUrl(item.imageUrl)
      : (siteLogo ?? null);

    const size: number = item.height ?? 48;

    return (
      source && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={`${styles.logo} ${variant ? (styles[variant] ?? "") : ""}`}
          src={source}
          alt=""
          style={{ width: size, height: size }}
          loading="lazy"
        />
      )
    );
  };

  const nameOf = (item: IStoreSiteFooterLink): ReactNode => (
    <p className={styles.name}>{item.label?.trim() || brandName}</p>
  );

  /** One item that is not a link, as the footer shows it. */
  const content = (item: IStoreSiteFooterLink): ReactNode => {
    switch (item.type) {
      case F.NAME:
        return nameOf(item);
      case F.LOGO:
        return logoOf(item);
      case F.NOTE:
        return item.label?.trim() ? (
          <p className={styles.text}>{item.label}</p>
        ) : null;
      case F.IMAGE: {
        if (!item.imageUrl) {
          return null;
        }

        const picture: ReactNode = (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.image}
            src={getImageUrl(item.imageUrl)}
            alt={item.label ?? ""}
            style={{ height: item.height ?? 80 }}
            loading="lazy"
          />
        );

        // It leads somewhere only when that is a safe address.
        return isSafeFooterUrl(item.url) ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={styles.imageLink}
          >
            {picture}
          </a>
        ) : (
          picture
        );
      }
      case F.SIGN_IN:
        return (
          <div className={styles.loginBox}>
            <SiteSignIn
              signIn={signIn}
              storeId={storeId}
              className={styles.login}
            />
            <span className={styles.loginHint}>
              {t("storeSite.footer.loginHint")}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  /**
   * What a section shows, in the owner's order: links that follow each other
   * go in one row, a logo right before a name goes beside it, and anything
   * else stands on its own.
   */
  const drawSection = (
    items: IStoreSiteFooterLink[],
    title: string | null,
  ): ReactNode[] => {
    const drawn: ReactNode[] = [];

    for (let at = 0; at < items.length; at++) {
      const item: IStoreSiteFooterLink = items[at];

      if (!isFooterContent(item.type)) {
        const row: IStoreSiteFooterLink[] = [];

        while (at < items.length && !isFooterContent(items[at].type)) {
          row.push(items[at]);
          at++;
        }

        at--;

        drawn.push(
          <ul
            key={row[0].key}
            className={styles.links}
            aria-label={title ?? t("storeSite.footer.links")}
          >
            {row.map((link: IStoreSiteFooterLink) => (
              <SiteFooterLink key={link.key} link={link} />
            ))}
          </ul>,
        );

        continue;
      }

      if (item.type === F.LOGO && items[at + 1]?.type === F.NAME) {
        drawn.push(
          <div key={item.key} className={styles.brand}>
            {logoOf(item)}
            {nameOf(items[at + 1])}
          </div>,
        );
        at++;

        continue;
      }

      drawn.push(<Fragment key={item.key}>{content(item)}</Fragment>);
    }

    return drawn;
  };

  const closing: ReactNode = (
    <div className={styles.bottom}>
      <span>
        © {year} {brandName}
      </span>
      <span>{t("storeSite.public.madeWith")}</span>
    </div>
  );

  if (!isActive) {
    return (
      <footer className={`${styles.footer} ${styles.bare}`}>{closing}</footer>
    );
  }

  // A link whose address is not a plain link never becomes one, whatever was stored.
  const shown: IStoreSiteFooterLink[] = links.filter(
    (link: IStoreSiteFooterLink) =>
      isFooterContent(link.type) || isSafeFooterUrl(link.url),
  );

  return (
    <footer ref={ref} data-phase={phase} className={styles.footer}>
      <div
        className={styles.inner}
        data-columns={sections.length}
        style={{ "--footer-columns": sections.length } as CSSProperties}
      >
        {sections.map((section: IStoreSiteFooterSection, index: number) => (
          <div
            key={section.key}
            className={styles.section}
            style={{ "--i": index } as CSSProperties}
          >
            {section.title && (
              <p className={styles.sectionTitle}>{section.title}</p>
            )}
            {drawSection(
              shown.filter(
                (link: IStoreSiteFooterLink) => link.section === section.key,
              ),
              section.title,
            )}
          </div>
        ))}
      </div>
      {closing}
    </footer>
  );
};

export default SiteFooter;
