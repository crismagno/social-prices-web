"use client";

import { CSSProperties, ReactNode } from "react";

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
  isSafeFooterUrl,
  IStoreSiteFooter,
  IStoreSiteFooterLink,
  IStoreSiteFooterSection,
  siteFooterOf,
} from "../../../shared/business/store-sites/store-site-footer";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import { IStoreSiteSignIn } from "../../../shared/business/store-sites/store-site-sign-in";
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
}

// A link of free text has no icon: it is just the owner's words.
const ICONS: Record<StoreSitesEnum.FooterLinkType, ReactNode> = {
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
const SiteFooter = ({ footer, brandName, signIn, storeId }: Props) => {
  // Its columns come in one after the other as it scrolls into view.
  const { ref, phase } = useReveal<HTMLElement>();

  const t = useSiteT();

  const {
    isActive,
    text,
    isLoginVisible,
    sections,
    textSection,
    loginSection,
    links,
  } = siteFooterOf(footer);

  const year: number = new Date().getFullYear();

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

  // An address that is not a plain link never becomes one, whatever was stored.
  const safeLinks: IStoreSiteFooterLink[] = links.filter(
    (link: IStoreSiteFooterLink) => isSafeFooterUrl(link.url),
  );

  return (
    <footer ref={ref} data-phase={phase} className={styles.footer}>
      <div
        className={styles.inner}
        data-columns={sections.length}
        style={{ "--footer-columns": sections.length } as CSSProperties}
      >
        {sections.map((section: IStoreSiteFooterSection, index: number) => {
          const sectionLinks: IStoreSiteFooterLink[] = safeLinks.filter(
            (link: IStoreSiteFooterLink) => link.section === section.key,
          );

          const hasText: boolean = textSection === section.key;

          const hasLogin: boolean =
            isLoginVisible && loginSection === section.key;

          return (
            <div
              key={section.key}
              className={styles.section}
              style={{ "--i": index } as CSSProperties}
            >
              {section.title && (
                <p className={styles.sectionTitle}>{section.title}</p>
              )}

              {hasText && (
                <>
                  <p className={styles.name}>{brandName}</p>
                  {text && <p className={styles.text}>{text}</p>}
                </>
              )}

              {sectionLinks.length > 0 && (
                <ul
                  className={styles.links}
                  aria-label={section.title ?? t("storeSite.footer.links")}
                >
                  {sectionLinks.map((link: IStoreSiteFooterLink) => (
                    <SiteFooterLink key={link.key} link={link} />
                  ))}
                </ul>
              )}

              {hasLogin && (
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
              )}
            </div>
          );
        })}
      </div>
      {closing}
    </footer>
  );
};

export default SiteFooter;
