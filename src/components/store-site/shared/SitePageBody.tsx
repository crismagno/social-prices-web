"use client";

import {
  IStoreSiteFooter,
  IStoreSiteFooterLink,
  siteFooterOf,
  isSafeFooterUrl,
} from "../../../shared/business/store-sites/store-site-footer";
import {
  IStoreSiteFaqItem,
  IStoreSitePage,
} from "../../../shared/business/store-sites/store-site-pages";
import StoreSitesEnum from "../../../shared/business/store-sites/store-sites.enum";
import Reveal from "./Reveal";
import SiteAbout, { TSiteAboutVariant } from "./SiteAbout";
import { SiteFooterLink } from "./SiteFooter";
import styles from "./SitePageBody.module.css";
import useSiteT from "./useSiteT";

interface Props {
  page: IStoreSitePage;
  variant: TSiteAboutVariant;
  titleClassName?: string;
  /** Where the ways to talk to the store come from. */
  footer: Partial<IStoreSiteFooter> | null | undefined;
}

/** The links of the footer that are a way to talk to the store. */
const CONTACT_TYPES: StoreSitesEnum.FooterLinkType[] = [
  StoreSitesEnum.FooterLinkType.WHATSAPP,
  StoreSitesEnum.FooterLinkType.EMAIL,
  StoreSitesEnum.FooterLinkType.PHONE,
  StoreSitesEnum.FooterLinkType.TELEGRAM,
];

/**
 * What a page shows below its top, for the pages that are not a part of the
 * home: the owner's own pages (their texts and an image or a video, in the
 * look of the template) and the support page (its words, its questions, and
 * the ways to talk to the store the footer already lists).
 */
const SitePageBody = ({ page, variant, titleClassName, footer }: Props) => {
  const t = useSiteT();

  const isSupport: boolean = page.type === StoreSitesEnum.SitePageType.SUPPORT;

  if (page.type !== StoreSitesEnum.SitePageType.CUSTOM && !isSupport) {
    return null;
  }

  const contacts: IStoreSiteFooterLink[] = isSupport
    ? siteFooterOf(footer).links.filter(
        (link: IStoreSiteFooterLink) =>
          CONTACT_TYPES.includes(link.type) && isSafeFooterUrl(link.url),
      )
    : [];

  return (
    <>
      <SiteAbout
        about={{
          isActive: true,
          title: null,
          texts: page.content.texts,
          media: page.content.media,
          mediaPosition: page.content.mediaPosition,
        }}
        storeAbout={null}
        defaultTitle={page.title ?? page.label ?? ""}
        variant={variant}
        titleClassName={titleClassName}
        // The top of the page already says it.
        isTitleHidden
      />

      {isSupport && (page.faq.length > 0 || contacts.length > 0) && (
        <section className={styles.support}>
          {page.faq.length > 0 && (
            <Reveal effect="up">
              <h2 className={`${styles.heading} ${titleClassName ?? ""}`}>
                {t("storeSite.support.faq")}
              </h2>
              <div className={styles.faq}>
                {page.faq.map((item: IStoreSiteFaqItem, index: number) => (
                  <details
                    key={index}
                    className={styles.question}
                    data-part={String(Math.min(index, 4))}
                  >
                    <summary>{item.question}</summary>
                    {item.answer && (
                      <p className={styles.answer}>{item.answer}</p>
                    )}
                  </details>
                ))}
              </div>
            </Reveal>
          )}

          {contacts.length > 0 && (
            <Reveal effect="up">
              <h2 className={`${styles.heading} ${titleClassName ?? ""}`}>
                {t("storeSite.support.contact")}
              </h2>
              <ul className={styles.contacts}>
                {contacts.map((link: IStoreSiteFooterLink) => (
                  <SiteFooterLink key={link.key} link={link} />
                ))}
              </ul>
            </Reveal>
          )}
        </section>
      )}
    </>
  );
};

export default SitePageBody;
